import { useEffect, useState } from 'react'
import AdminHome from '@/components/admin/AdminHome'
import AdminLogin from '@/components/admin/AdminLogin'
import AssetManager from '@/components/admin/AssetManager'
import BrandingConfig from '@/components/admin/BrandingConfig'
import CampaignList from '@/components/admin/CampaignList'
import CarouselEditor from '@/components/admin/CarouselEditor'
import ContactMessagesManager from '@/components/admin/ContactMessagesManager'
import ContentCalendar from '@/components/admin/ContentCalendar'
import ContentEditor from '@/components/admin/ContentEditor'
import EngagementMetrics from '@/components/admin/EngagementMetrics'
import NotificationsConfig from '@/components/admin/NotificationsConfig'
import OrdersManager from '@/components/admin/OrdersManager'
import PostCard from '@/components/admin/PostCard'
import PostCreator from '@/components/admin/PostCreator'
import ProductManager from '@/components/admin/ProductManager'
import RewardScoringView from '@/components/admin/RewardScoringView'
import SocialConnect from '@/components/admin/SocialConnect'
import TwoFactorSetup from '@/components/admin/TwoFactorSetup'
import { useAuthStore } from '@/stores/authStore'
import { useCMSStore } from '@/stores/cmsStore'
import { useSocialStore } from '@/stores/socialStore'
import type { SocialPost } from '@/types/social'

const TABS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'inventario', label: 'Productos' },
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'mensajes', label: 'Mensajes' },
  { id: 'notificaciones', label: 'Alertas' },
  { id: 'contenido', label: 'Contenido' },
  { id: 'carrusel', label: 'Carrusel' },
  { id: 'branding', label: 'Marca' },
  { id: '2fa', label: '2FA' },
  { id: 'campanas', label: 'Marketing' },
  { id: 'rewards', label: 'Rewards' },
]

const POST_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'draft', label: 'Borradores' },
  { id: 'scheduled', label: 'Programadas' },
  { id: 'published', label: 'Publicadas' },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [showCreator, setShowCreator] = useState(false)
  const [postFilter, setPostFilter] = useState('all')
  const [editingPost, setEditingPost] = useState<SocialPost | undefined>(undefined)

  const posts = useSocialStore((s) => s.posts)
  const campaigns = useSocialStore((s) => s.campaigns)
  const removePost = useSocialStore((s) => s.removePost)
  const publishPost = useSocialStore((s) => s.publishPost)
  const token = useAuthStore((s) => s.token)
  const getCurrentCustomer = useAuthStore((s) => s.getCurrentCustomer)
  const logout = useAuthStore((s) => s.logout)
  const twoFactor = useCMSStore((s) => s.twoFactor)
  const fetch2FAStatus = useCMSStore((s) => s.fetch2FAStatus)
  // const [securityChecked, setSecurityChecked] = useState(false)
  const admin = getCurrentCustomer()

  useEffect(() => {
    if (!token || admin?.role !== 'admin') return

    //setSecurityChecked(false)
    //fetch2FAStatus().finally(() => setSecurityChecked(true))
    console.log(token, admin)
  }, [token, admin?.role, fetch2FAStatus])

  // if (!token || admin?.role !== 'admin') {
  //   return <AdminLogin />
  // }

  // if (!securityChecked) {
  //   return (
  //     <div className='admin-page'>
  //       <div className='admin-panel-empty'>Validando seguridad del panel...</div>
  //     </div>
  //   )
  // }

  const filteredPosts = postFilter === 'all' ? posts : posts.filter((p) => p.status === postFilter)
  const has2FA = twoFactor.enabled

  const getCampaignName = (campaignId: string) =>
    campaigns.find((c) => c.id === campaignId)?.name ?? ''

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post)
    setShowCreator(true)
  }

  const handleCloseCreator = () => {
    setShowCreator(false)
    setEditingPost(undefined)
  }

  return (
    <div className='admin-page'>
      <div className='admin-heading-row'>
        <h1 className='admin-title'>Panel de Administracion</h1>
        <button className='btn-secondary btn-small' onClick={logout} type='button'>
          Salir
        </button>
      </div>
      <div className='admin-tabs' role='tablist' aria-label='Secciones de administración'>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role='tab'
            aria-selected={activeTab === tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type='button'
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className='admin-content' role='tabpanel'>
        {!has2FA && activeTab !== '2fa' && (
          <div className='admin-notice'>2FA esta disponible como proteccion opcional.</div>
        )}
        {activeTab === 'inicio' && <AdminHome onNavigate={setActiveTab} />}
        {activeTab === 'branding' && <BrandingConfig />}
        {activeTab === 'pedidos' && <OrdersManager />}
        {activeTab === 'mensajes' && <ContactMessagesManager />}
        {activeTab === 'notificaciones' && <NotificationsConfig />}
        {activeTab === 'inventario' && <ProductManager />}
        {activeTab === 'contenido' && <ContentEditor />}
        {activeTab === 'carrusel' && <CarouselEditor />}
        {activeTab === '2fa' && <TwoFactorSetup />}
        {activeTab === 'rewards' && <RewardScoringView />}
        {activeTab === 'campanas' && (
          <div className='social-dashboard'>
            <SocialConnect />

            <div className='social-section__header'>
              <h3>Posts</h3>
              {!showCreator && (
                <button
                  className='btn-primary btn-small'
                  onClick={() => setShowCreator(true)}
                  type='button'
                >
                  + Nuevo post
                </button>
              )}
            </div>

            {showCreator && <PostCreator onClose={handleCloseCreator} editPost={editingPost} />}

            <div className='social-subtabs'>
              {POST_TABS.map((t) => (
                <button
                  key={t.id}
                  className={`social-subtab ${postFilter === t.id ? 'active' : ''}`}
                  onClick={() => setPostFilter(t.id)}
                  type='button'
                >
                  {t.label} (
                  {t.id === 'all' ? posts.length : posts.filter((p) => p.status === t.id).length})
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <p className='social-empty'>No hay posts en esta categoría.</p>
            ) : (
              <div className='posts-grid'>
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    campaignName={post.campaignId ? getCampaignName(post.campaignId) : undefined}
                    onEdit={() => handleEdit(post)}
                    onDelete={() => removePost(post.id)}
                    onPublish={() => publishPost(post.id)}
                  />
                ))}
              </div>
            )}

            <ContentCalendar />
            <CampaignList />
            <EngagementMetrics />
            <AssetManager />
          </div>
        )}
      </div>
    </div>
  )
}
