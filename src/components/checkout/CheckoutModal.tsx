import { useState } from 'react'
import Modal from '@/components/shared/Modal'
import type { OrderData } from '@/data/waTemplates'
import { WA_TEMPLATES } from '@/data/waTemplates'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useConfigStore } from '@/stores/configStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useUIStore } from '@/stores/uiStore'
import { useWAConfigStore } from '@/stores/waConfigStore'
import CheckoutForm from './CheckoutForm'
import OrderSummary from './OrderSummary'

export default function CheckoutModal() {
  const isOpen = useUIStore((s) => s.isCheckoutModalOpen)
  const closeCheckoutModal = useUIStore((s) => s.closeCheckoutModal)
  const items = useCartStore((s) => s.items)
  const shippingCost = useCartStore((s) => s.shippingCost)
  const shippingMethod = useCartStore((s) => s.shippingMethod)
  const getTotal = useCartStore((s) => s.getTotal)
  const submitOrder = useCartStore((s) => s.submitOrder)
  const pushNotif = useNotificationStore((s) => s.push)
  const config = useConfigStore((s) => s.config)
  const waConfig = useWAConfigStore((s) => s.config)
  const token = useAuthStore((s) => s.token)
  const customer = useAuthStore((s) => s.getCurrentCustomer())

  const [form, setForm] = useState({
    name: '',
    phone: '',
    province: '',
    canton: '',
    district: '',
    address: '',
    sinpeReference: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofFileName, setProofFileName] = useState('')
  const [proofUploading, setProofUploading] = useState(false)

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openWa = (phone: string, message: string) => {
    window.open(
      `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank',
    )
  }

  const buildOrderText = () => {
    return items
      .map(
        (i) =>
          `${i.quantity}x ${i.product.name} (${i.size}) — ${config.currencySymbol}${(i.product.price * i.quantity).toFixed(0)}`,
      )
      .join('\n')
  }

  const buildAddressText = () => {
    return form.province ? `${form.province}, ${form.canton}, ${form.district}` : ''
  }

  const openProofFallback = () => {
    const addressText = buildAddressText()
    const fallbackMsg = [
      `🦇 *PEDIDO NEKO - COMPROBANTE SINPE*`,
      '────────────────────',
      `*Cliente:* ${form.name || 'Pendiente'}`,
      `*Tel:* +506 ${form.phone || 'Pendiente'}`,
      addressText ? `*Envio:* ${addressText}` : '*Envio:* Direccion pendiente o retiro',
      '────',
      buildOrderText(),
      '────',
      `*Total:* ${config.currencySymbol}${getTotal().toFixed(2)}`,
      'Adjunto el comprobante SINPE para confirmar mi pedido.',
    ]
      .filter(Boolean)
      .join('\n')

    openWa(waConfig.adminPhone || config.whatsappNumber, fallbackMsg)
  }

  const handleProofFileChange = (file: File | null) => {
    setProofFile(file)
    setProofFileName(file?.name ?? '')
  }

  const handleConfirm = async () => {
    if (!form.name || !form.phone) {
      pushNotif({
        icon: '\u26A0\uFE0F',
        title: 'Campos requeridos',
        msg: 'Completa nombre y tel\u00E9fono',
        type: 'warning',
      })
      return
    }
    if (!token || !customer) {
      pushNotif({
        icon: '\u26A0\uFE0F',
        title: 'Inicia sesion',
        msg: 'Debes validar tu WhatsApp antes de reservar el pedido.',
        type: 'warning',
      })
      return
    }

    if (!proofFile) {
      openProofFallback()
      pushNotif({
        icon: '\u26A0\uFE0F',
        title: 'Comprobante requerido',
        msg: 'Te abrimos WhatsApp para enviar el comprobante y terminar la reserva.',
        type: 'warning',
      })
      return
    }

    setSubmitting(true)

    const addressText = buildAddressText()

    const itemsText = buildOrderText()

    const fullAddress = form.province
      ? `${addressText} \u2014 ${form.address}`
      : 'Recogida en tienda'

    let paymentProof: { url: string; filename: string }
    try {
      setProofUploading(true)
      paymentProof = await api.orders.uploadPaymentProof(proofFile)
    } catch (err) {
      setSubmitting(false)
      setProofUploading(false)
      pushNotif({
        icon: '\u26A0\uFE0F',
        title: 'Comprobante no subido',
        msg: err instanceof Error ? err.message : 'Intenta otra vez o envialo por WhatsApp.',
        type: 'error',
      })
      return
    } finally {
      setProofUploading(false)
    }

    const result = await submitOrder({
      address: fullAddress,
      notes: form.notes,
      paymentReference: form.sinpeReference,
      paymentProofUrl: paymentProof.url,
      paymentProofName: paymentProof.filename,
    })

    if (!result.ok || !result.order) {
      setSubmitting(false)
      pushNotif({
        icon: '\u26A0\uFE0F',
        title: 'No se pudo reservar',
        msg: result.error || 'Revisa el stock e intenta de nuevo.',
        type: 'error',
      })
      return
    }

    const order = result.order
    const orderId = String(order.id)
    const total = Number(order.total ?? getTotal())
    const pointsEarned = Number(order.points_earned ?? Math.floor(total / 500))

    const orderData: OrderData = {
      orderId,
      name: form.name,
      phone: `+506 ${form.phone}`,
      address: fullAddress,
      notes: form.notes,
      itemsText,
      shippingMethod,
      shippingCost,
      total,
      pointsEarned,
      currencySymbol: config.currencySymbol,
      storeName: config.storeName,
    }

    let openedCustomer = false
    let openedAdmin = false

    if (waConfig.enabledCustomerTypes.includes('order_confirmed')) {
      const msg = WA_TEMPLATES.order_confirmed(orderData)
      const customerPhone = form.phone.replace(/\D/g, '')
      if (customerPhone && customerPhone.length >= 8) {
        openWa(customerPhone, msg)
        openedCustomer = true
      }
    }

    if (waConfig.enabledAdminTypes.includes('new_order_admin')) {
      const msg = WA_TEMPLATES.new_order_admin(orderData)
      openWa(waConfig.adminPhone, msg)
      openedAdmin = true
    }

    if (!openedCustomer && !openedAdmin) {
      const fallbackMsg = [
        `\uD83E\uDD87 *NUEVO PEDIDO - ${config.storeName}*`,
        '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500',
        `*Cliente:* ${form.name}`,
        `*Tel:* +506 ${form.phone}`,
        form.province ? `*Env\u00EDo:* ${addressText}` : '',
        '\u2500\u2500\u2500\u2500',
        itemsText,
        '\u2500\u2500\u2500\u2500',
        `*Total:* ${config.currencySymbol}${total.toFixed(2)}`,
        form.notes ? `*Notas:* ${form.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      openWa(config.whatsappNumber, fallbackMsg)
    }

    closeCheckoutModal()
    setSubmitting(false)

    pushNotif({
      icon: '\uD83E\uDD87',
      title: 'Pedido reservado',
      msg: openedCustomer
        ? 'Queda pendiente confirmar el SINPE para preparar tu pedido.'
        : 'Reserva creada. Te contactaremos para confirmar el SINPE.',
      type: 'success',
    })
  }

  if (items.length === 0) return null

  return (
    <Modal isOpen={isOpen} onClose={closeCheckoutModal} className='checkout-modal'>
      <div className='checkout-inner'>
        <h2>Confirmar Pedido</h2>
        <p className='checkout-sub'>Reservamos stock y confirmamos el pago por SINPE.</p>
        <CheckoutForm
          form={form}
          onChange={updateField}
          onProofFileChange={handleProofFileChange}
          proofFileName={proofFileName}
          proofUploading={proofUploading}
        />
        <OrderSummary />
        <button
          className='btn-primary btn-full btn-whatsapp'
          onClick={handleConfirm}
          type='button'
          disabled={submitting || proofUploading}
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='white' aria-hidden='true'>
            <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
          </svg>
          {submitting ? 'Reservando...' : 'Reservar pedido y confirmar SINPE'}
        </button>
      </div>
    </Modal>
  )
}
