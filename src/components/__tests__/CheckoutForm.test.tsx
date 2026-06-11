import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CheckoutForm from '@/components/checkout/CheckoutForm'

const defaultForm = {
  name: '',
  phone: '',
  province: '',
  canton: '',
  district: '',
  address: '',
  sinpeReference: '',
  notes: '',
}

const defaultProps = {
  form: defaultForm,
  onChange: vi.fn(),
  onProofFileChange: vi.fn(),
  proofFileName: '',
  proofUploading: false,
}

describe('CheckoutForm', () => {
  it('renders all form fields', () => {
    render(<CheckoutForm {...defaultProps} />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeDefined()
    expect(screen.getByLabelText(/tel/i)).toBeDefined()
    expect(screen.getByLabelText(/provincia/i)).toBeDefined()
    expect(screen.getByLabelText(/cant/i)).toBeDefined()
    expect(screen.getByLabelText(/distrito/i)).toBeDefined()
    expect(screen.getByLabelText(/señas exactas/i)).toBeDefined()
    expect(screen.getByLabelText(/notas adicionales/i)).toBeDefined()
    expect(screen.getByLabelText(/comprobante sinpe/i)).toBeDefined()
  })

  it('calls onChange when typing in name field', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<CheckoutForm {...defaultProps} onChange={onChange} />)
    const input = screen.getByLabelText(/nombre completo/i)
    await user.type(input, 'V')
    expect(onChange).toHaveBeenCalledWith('name', 'V')
  })

  it('displays current form values', () => {
    const form = { ...defaultForm, name: 'Valentina', phone: '8888-7777' }
    render(<CheckoutForm {...defaultProps} form={form} />)
    expect(screen.getByDisplayValue('Valentina')).toBeDefined()
    expect(screen.getByDisplayValue('8888-7777')).toBeDefined()
  })
})
