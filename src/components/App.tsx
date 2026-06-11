'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Recipe, AppSettings, Ingredient, RecipeUrl } from '@/types'
import styles from './App.module.css'

// ── SVG Line Icons ──
const BookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const HeartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const MenuIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const ChevronLeftIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const FavHeartIcon = ({ filled }: { filled: boolean }) => <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? '#E24B4A' : 'none'} stroke={filled ? '#E24B4A' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const LinkIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const PencilIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const CartIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
const FileTextIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const TagIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
const LeafIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.36a1 1 0 0 0 1.64 1.14L8 18.4c1.66 1.67 4.5 2.6 7 2.6 6 0 9-8 9-12S14 2 8 2c0 0 1 2 2 3"/></svg>
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const LoadingIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
const PotIcon = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M8 12V7a4 4 0 0 1 8 0v5"/><line x1="10" y1="7" x2="10" y2="4"/><line x1="14" y1="7" x2="14" y2="4"/></svg>
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const XIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

// ── Sub-components are defined below the main component ──

const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  tag_types: {
    '料理風格': ['中式','西式','日式','韓式','泰式','義式'],
    '難易度': ['簡單','中等','困難'],
    '場合': ['日常','宴客','便當','快速料理','節日'],
  },
  ingredient_categories: ['肉類','蔬菜','其他','調味料'],
  common_ingredients: {
    '肉類': ['雞肉','豬肉','牛肉','蛋','豬絞肉','培根','蝦','鮭魚','豆腐'],
    '蔬菜': ['番茄','洋蔥','蔥','蒜','薑','高麗菜','青椒','紅蘿蔔','白菜','菠菜','花椰菜'],
    '調味料': ['鹽','糖','醬油','米酒','白醋','番茄醬','番茄糊','黑胡椒','白胡椒','辣椒醬','蠔油','味噌','芝麻油'],
    '其他': ['義大利麵','白飯','麵粉','橄欖油','奶油','雞高湯','麵包粉','起司'],
  },
}

type View = 'list' | 'favorites' | 'search' | 'settings'

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null)
  const [scales, setScales] = useState<Record<number, number>>({})
  const [toast, setToast] = useState<{ msg: string; undoId?: number } | null>(null)
  const [deletedRecipes, setDeletedRecipes] = useState<Recipe[]>([])
  const [confirmDelete, setConfirmDelete] = useState<Recipe | null>(null)
  const [searchState, setSearchState] = useState({
    query: '', ingredients: [] as string[], tagFilters: {} as Record<string,string[]>, mode: 'OR' as 'OR'|'AND', favOnly: false
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // ── Data loading ──
  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: recs }, { data: sets }] = await Promise.all([
      supabase.from('recipes').select('*').order('created_at', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 1).single(),
    ])
    if (recs) setRecipes(recs)
    if (sets) setSettings(sets)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Toast ──
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  // ── Recipe CRUD ──
  const openRecipe = (id: number) => {
    setCurrentId(id)
    setEditRecipe(null)
    setSidebarOpen(false)
    if (view === 'search') setView('list')
  }

  const saveRecipe = async (r: Recipe) => {
    if (!r.name.trim()) { setToast({ msg: '請填寫食譜名稱' }); return }
    if (r.id && recipes.find(x => x.id === r.id)) {
      const { data } = await supabase.from('recipes').update(r).eq('id', r.id).select().single()
      if (data) { setRecipes(prev => [data, ...prev.filter(x => x.id !== r.id)]); setCurrentId(r.id) }
    } else {
      const { id: _id, ...rest } = r as any
      const { data } = await supabase.from('recipes').insert(rest).select().single()
      if (data) { setRecipes(prev => [data, ...prev]); setCurrentId(data.id) }
    }
    setEditRecipe(null)
    setToast({ msg: '已儲存' })
  }

  const deleteRecipe = async (r: Recipe) => {
    setDeletedRecipes(prev => [r, ...prev].slice(0, 10))
    await supabase.from('recipes').delete().eq('id', r.id)
    setRecipes(prev => prev.filter(x => x.id !== r.id))
    setCurrentId(null)
    setConfirmDelete(null)
    setToast({ msg: `已刪除「${r.name}」`, undoId: r.id })
  }

  const undoDelete = async (id: number) => {
    const r = deletedRecipes.find(x => x.id === id)
    if (!r) return
    const { id: _id, ...rest } = r as any
    const { data } = await supabase.from('recipes').insert(rest).select().single()
    if (data) {
      setRecipes(prev => [data, ...prev])
      setDeletedRecipes(prev => prev.filter(x => x.id !== id))
      setCurrentId(data.id)
      setToast({ msg: `已復原「${r.name}」` })
    }
  }

  const toggleFav = async (id: number) => {
    const r = recipes.find(x => x.id === id)
    if (!r) return
    await supabase.from('recipes').update({ favorite: !r.favorite }).eq('id', id)
    setRecipes(prev => prev.map(x => x.id === id ? { ...x, favorite: !x.favorite } : x))
  }

  // ── Settings CRUD ──
  const saveSettings = async (next: AppSettings) => {
    setSettings(next)
    await supabase.from('app_settings').update(next).eq('id', 1)
  }

  const currentRecipe = recipes.find(r => r.id === currentId) || null

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text3)', fontFamily:'var(--font-body)' }}>
      載入中…
    </div>
  )

  return (
    <div className={styles.app}>
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}
      {!sidebarOpen && (
        <div className={styles.edgeSwipeZone}
          onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - touchStartX.current
            const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
            if (dx > 50 && dy < 80) setSidebarOpen(true)
          }}
        />
      )}
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - touchStartX.current
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
          if (dx < -50 && dy < 80) setSidebarOpen(false)
        }}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>食譜本</div>
          <button className={styles.sidebarToggleBtn} onClick={() => setSidebarOpen(false)} title="收合側欄">
            <ChevronLeftIcon />
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {([
            { v: 'list', label: '所有食譜', icon: <BookIcon /> },
            { v: 'favorites', label: '我的最愛', icon: <HeartIcon /> },
            { v: 'search', label: '搜尋', icon: <SearchIcon /> },
          ] as { v: View; label: string; icon: React.ReactNode }[]).map(({ v, label, icon }) => (
            <button key={v} className={`${styles.navItem} ${view===v?styles.navActive:''}`} onClick={() => { setView(v); setEditRecipe(null); setCurrentId(null); setSidebarOpen(false) }}>
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </button>
          ))}
          <div className={styles.divider} />
          <button className={`${styles.navItem} ${view==='settings'?styles.navActive:''}`} onClick={() => { setView('settings'); setEditRecipe(null); setSidebarOpen(false) }}>
            <span className={styles.navIcon}><SettingsIcon /></span> 設定
          </button>
        </nav>
        <button className={styles.addBtn} onClick={() => {
          setSidebarOpen(false)
          const blank: Recipe = {
            id: 0, name: '', servings: 2, favorite: false, last_used: null,
            tags: {}, ingredients: Object.fromEntries(settings.ingredient_categories.map(c=>[c,[]])),
            urls: [], note: ''
          }
          setEditRecipe(blank)
          setCurrentId(null)
          setView('list')
        }}>＋ 新增食譜</button>
        <div className={styles.recipeList}>
          {recipes.map(r => (
            <button key={r.id} className={`${styles.recipeItem} ${currentId===r.id?styles.recipeItemActive:''}`} onClick={() => openRecipe(r.id)}>
              <div className={styles.recipeItemName}>{r.name}</div>
              <div className={styles.recipeItemMeta}>
                {r.favorite && <span style={{color:'#E24B4A',display:'inline-flex',alignItems:'center'}}><FavHeartIcon filled={true} /></span>}
                <span>{r.servings}人份</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {editRecipe ? (
          <RecipeForm
            recipe={editRecipe}
            settings={settings}
            onSave={saveRecipe}
            onCancel={() => { setEditRecipe(null); if(currentId) openRecipe(currentId) }}
          />
        ) : view === 'settings' ? (
          <SettingsPanel settings={settings} onSave={saveSettings} />
        ) : view === 'search' ? (
          <SearchPanel
            recipes={recipes}
            settings={settings}
            searchState={searchState}
            onSearchChange={setSearchState}
            onOpen={openRecipe}
          />
        ) : currentRecipe ? (
          <RecipeView
            recipe={currentRecipe}
            scale={scales[currentRecipe.id] || 1}
            onScaleChange={(s) => setScales(prev => ({ ...prev, [currentRecipe.id]: s }))}
            onEdit={() => setEditRecipe(JSON.parse(JSON.stringify(currentRecipe)))}
            onDelete={() => setConfirmDelete(currentRecipe)}
            onToggleFav={() => toggleFav(currentRecipe.id)}
            settings={settings}
          />
        ) : (
          <RecipeGrid
            recipes={view === 'favorites' ? recipes.filter(r => r.favorite) : recipes}
            onOpen={openRecipe}
          />
        )}
      </main>

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>刪除「{confirmDelete.name}」？</div>
            <div className={styles.modalBody}>刪除後可立即復原，關閉頁面後將無法復原。</div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setConfirmDelete(null)}>取消</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deleteRecipe(confirmDelete)}>確認刪除</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={styles.toast}>
          <CheckIcon /> {toast.msg}
          {toast.undoId && (
            <button className={styles.toastUndo} onClick={() => { undoDelete(toast.undoId!); setToast(null) }}>復原</button>
          )}
        </div>
      )}

      {/* SIDEBAR OPEN BUTTON */}
      {!sidebarOpen && (
        <button className={styles.sidebarOpenBtn} onClick={() => setSidebarOpen(true)} title="展開側欄">
          <MenuIcon />
        </button>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// RECIPE VIEW
// ──────────────────────────────────────────────
function RecipeView({ recipe, scale, onScaleChange, onEdit, onDelete, onToggleFav, settings }: {
  recipe: Recipe, scale: number, onScaleChange: (s:number)=>void,
  onEdit: ()=>void, onDelete: ()=>void, onToggleFav: ()=>void, settings: AppSettings
}) {
  const displayServings = Math.round(recipe.servings * scale)

  const changeScale = (delta: number) => {
    const newDisplay = Math.max(1, displayServings + delta)
    onScaleChange(newDisplay / recipe.servings)
  }

  const scaleAmount = (amt: string) => {
    if (!amt || isNaN(parseFloat(amt)) || scale === 1) return amt
    const sc = parseFloat(amt) * scale
    return Number.isInteger(sc) ? String(sc) : sc.toFixed(1)
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div className={styles.topbarTitle}>{recipe.name}</div>
        <button className={styles.btn} onClick={onEdit}><PencilIcon /> 編輯</button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}><TrashIcon /> 刪除</button>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.recipeHeader}>
            <h1 className={styles.recipeName}>{recipe.name}</h1>
          </div>

          {/* Tags */}
          {Object.entries(recipe.tags || {}).some(([,v]) => v?.length) && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}>Tags</div>
              {Object.entries(recipe.tags || {}).map(([type, vals]) =>
                vals?.length ? (
                  <div key={type} className={styles.tagGroupRow}>
                    <span className={styles.tagTypeLabel}>{type}</span>
                    {vals.map(v => <span key={v} className={styles.tagBadge}>{v}</span>)}
                  </div>
                ) : null
              )}
            </div>
          )}

          <div className={styles.servingScaler}>
            <button className={styles.servingBtn} onClick={() => changeScale(-1)}>−</button>
            <span>{displayServings} 人份</span>
            <button className={styles.servingBtn} onClick={() => changeScale(1)}>＋</button>
            {scale !== 1 && <button className={styles.resetLink} onClick={() => onScaleChange(1)}>重設</button>}
            <button className={styles.favBtn} onClick={onToggleFav} title={recipe.favorite ? '取消最愛' : '加入最愛'}>
              <FavHeartIcon filled={recipe.favorite} />
            </button>
          </div>

          {(recipe.urls || []).length > 0 && (
            <div className={styles.urlList}>
              {recipe.urls.map((u, i) => (
                <div key={i} className={styles.urlBlock}>
                  <a href={u.url} target="_blank" rel="noreferrer" className={styles.urlBlockName}>
                    <LinkIcon /> {u.name || `來源 ${i + 1}`}
                  </a>
                  <div className={styles.urlBlockUrl}>{u.url}</div>
                  {u.note && <div className={styles.urlBlockNote}>{u.note}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}><CartIcon /> 食材</div>
            {settings.ingredient_categories.map(cat => {
              const ings = (recipe.ingredients[cat] || []).filter(i => i.name)
              if (!ings.length) return null
              return (
                <div key={cat}>
                  <div className={styles.ingCatTitle}>{cat}</div>
                  <div className={styles.ingGrid}>
                    {ings.map((ing, i) => (
                      <div key={i} className={styles.ingItem}>
                        <span>{ing.name}</span>
                        <span className={styles.ingAmount}>{ing.amount ? scaleAmount(ing.amount) + ' ' + (ing.unit || '') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Note */}
          {recipe.note && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionTitle}><FileTextIcon /> 備注</div>
              <div className={styles.noteBox}>{recipe.note}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// RECIPE FORM
// ──────────────────────────────────────────────
function RecipeForm({ recipe, settings, onSave, onCancel }: {
  recipe: Recipe, settings: AppSettings,
  onSave: (r: Recipe) => void, onCancel: () => void
}) {
  const [r, setR] = useState<Recipe>(JSON.parse(JSON.stringify(recipe)))
  const [acState, setAcState] = useState<{cat:string,i:number,results:string[]} | null>(null)
  const [fetchResults, setFetchResults] = useState<Record<number, {
    status: 'loading'|'done'|'fail'
    title?: string
    detected?: {name:string;amount:string;unit:string}[]
  }>>({})

  const isEdit = Boolean(recipe.id && recipe.id > 0)

  const ingWithCats = { ...r.ingredients }
  settings.ingredient_categories.forEach(c => { if (!ingWithCats[c]) ingWithCats[c] = [] })

  const setField = (field: keyof Recipe, val: any) => setR(prev => ({ ...prev, [field]: val }))

  const updateIng = (cat: string, i: number, field: keyof Ingredient, val: string) => {
    const next = { ...ingWithCats }
    if (!next[cat]) next[cat] = []
    const arr = [...next[cat]]
    arr[i] = { ...arr[i], [field]: val }
    next[cat] = arr
    setField('ingredients', next)
  }

  const addIng = (cat: string) => {
    const next = { ...ingWithCats }
    next[cat] = [...(next[cat] || []), { name: '', amount: '', unit: '' }]
    setField('ingredients', next)
  }

  const addIngByName = (cat: string, name: string) => {
    setR(prev => {
      const cur = prev.ingredients[cat] || []
      if (cur.some(i => i.name === name)) return prev
      return { ...prev, ingredients: { ...prev.ingredients, [cat]: [...cur, { name, amount: '', unit: '' }] } }
    })
  }

  const removeIng = (cat: string, i: number) => {
    const next = { ...ingWithCats }
    next[cat] = next[cat].filter((_, idx) => idx !== i)
    setField('ingredients', next)
  }

  const showAC = (cat: string, i: number, val: string) => {
    if (!val.trim()) { setAcState(null); return }
    const common = settings.common_ingredients[cat] || []
    const exact = common.filter(c => c.includes(val) && c !== val)
    const fuzzy = common.filter(c => levenshtein(c, val) === 1 && !exact.includes(c) && c !== val)
    const results = [...exact, ...fuzzy].slice(0, 6)
    setAcState(results.length ? { cat, i, results } : null)
  }

  const toggleTag = (type: string, val: string) => {
    const cur = r.tags[type] || []
    const next = cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]
    setField('tags', { ...r.tags, [type]: next })
  }

  const addUrl = () => setField('urls', [...(r.urls || []), { url: '', name: '', note: '' }])
  const removeUrl = (i: number) => setField('urls', r.urls.filter((_, idx) => idx !== i))
  const updateUrl = (i: number, field: keyof RecipeUrl, val: string) => {
    const next = [...r.urls]
    next[i] = { ...next[i], [field]: val }
    setField('urls', next)
  }

  const tryFetch = async (i: number, url: string) => {
    if (!url || !url.startsWith('http')) return
    setFetchResults(prev => ({ ...prev, [i]: { status: 'loading' } }))
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.ok) {
        const detected = parseIngredientsFromText(data.description || '')
        if (data.title) {
          setR(prev => {
            if (prev.urls[i]?.name) return prev
            const nextUrls = [...prev.urls]
            nextUrls[i] = { ...nextUrls[i], name: data.title }
            return { ...prev, urls: nextUrls }
          })
        }
        setFetchResults(prev => ({ ...prev, [i]: { status: 'done', title: data.title, detected } }))
      } else {
        setFetchResults(prev => ({ ...prev, [i]: { status: 'fail' } }))
      }
    } catch {
      setFetchResults(prev => ({ ...prev, [i]: { status: 'fail' } }))
    }
  }

  const addDetectedIng = (ing: {name:string;amount:string;unit:string}) => {
    let targetCat = settings.ingredient_categories[settings.ingredient_categories.length - 1] || '其他'
    for (const cat of settings.ingredient_categories) {
      if ((settings.common_ingredients[cat] || []).includes(ing.name)) { targetCat = cat; break }
    }
    setR(prev => {
      const cur = prev.ingredients[targetCat] || []
      if (cur.some(x => x.name === ing.name)) return prev
      return { ...prev, ingredients: { ...prev.ingredients, [targetCat]: [...cur, ing] } }
    })
  }

  return (
    <div>
      <div className={styles.topbar}>
        <div className={styles.topbarTitle}>{isEdit ? '編輯食譜' : '新增食譜'}</div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onSave(r)}>✓ 儲存</button>
        <button className={styles.btn} onClick={onCancel}>✕ 取消</button>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>

          {/* BASIC */}
          <div className={styles.formSectionHeader}>基本資料</div>
          <div className={styles.formSection}>
            <label className={styles.formLabel}>食譜名稱 *</label>
            <input className={styles.formInput} value={r.name} placeholder="例：番茄炒蛋" onChange={e => setField('name', e.target.value)} />
          </div>
          <div style={{display:'flex',gap:16,alignItems:'flex-end',flexWrap:'wrap'}}>
            <div className={styles.formSection} style={{maxWidth:180}}>
              <label className={styles.formLabel}>基準份量（人份）</label>
              <select className={styles.formSelect} value={r.servings} onChange={e => setField('servings', parseInt(e.target.value))}>
                {[1,2,3,4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n} 人份</option>)}
              </select>
            </div>
            <div className={styles.formSection}>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13,color:'var(--text2)'}}>
                <input type="checkbox" checked={r.favorite} onChange={e => setField('favorite', e.target.checked)} /> 加入最愛
              </label>
            </div>
          </div>

          <div className={styles.formSectionGap} />

          {/* TAGS */}
          <div className={styles.formSectionHeader}>Tags</div>
          {Object.entries(settings.tag_types).map(([type, vals]) => (
            <div key={type} className={styles.formSection}>
              <label className={styles.formLabel}>{type}</label>
              <div className={styles.tagSelectGrid}>
                {vals.map(v => (
                  <button key={v}
                    className={`${styles.selectTag} ${(r.tags[type]||[]).includes(v)?styles.selectTagActive:''}`}
                    onClick={() => toggleTag(type, v)}>{v}</button>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.formSectionGap} />

          {/* URLS */}
          <div className={styles.formSectionHeader}>來源連結</div>
          {(r.urls || []).map((u, i) => {
            const fr = fetchResults[i]
            return (
              <div key={i} className={styles.urlFormBlock}>
                <div className={styles.urlBlockHeader}>
                  <span className={styles.urlBlockLabel}>來源 {i+1}</span>
                  <button className={styles.removeBtn} onClick={() => removeUrl(i)}>✕</button>
                </div>
                <input className={styles.formInput} style={{marginBottom:6}} value={u.url} placeholder="https://…"
                  onChange={e => updateUrl(i,'url',e.target.value)}
                  onBlur={e => tryFetch(i, e.target.value)} />
                {fr?.status === 'loading' && <div className={styles.fetchHintLoading}><LoadingIcon /> 讀取中…</div>}
                {fr?.status === 'fail' && <div className={styles.fetchHintFail}><AlertIcon /> 無法讀取，請手動填寫</div>}
                <input className={styles.formInput} style={{marginBottom:6}} value={u.name} placeholder="顯示名稱（自動帶入或手動填）" onChange={e => updateUrl(i,'name',e.target.value)} />
                <input className={styles.formInput} value={u.note} placeholder="備注（選填）" onChange={e => updateUrl(i,'note',e.target.value)} />
                {fr?.status === 'done' && fr.detected && fr.detected.length > 0 && (
                  <div className={styles.detectedIngBox}>
                    <div className={styles.detectedIngTitle}>偵測到 {fr.detected.length} 項食材，點擊加入 ↓</div>
                    <div className={styles.detectedIngRow}>
                      {fr.detected.map((ing, di) => {
                        const alreadyAdded = Object.values(ingWithCats).flat().some(x => x.name === ing.name)
                        return (
                          <button key={di}
                            className={`${styles.detectedIngChip} ${alreadyAdded ? styles.detectedIngChipAdded : ''}`}
                            onClick={() => !alreadyAdded && addDetectedIng(ing)}>
                            {alreadyAdded ? '✓ ' : ''}{ing.name}{ing.amount ? ` ${ing.amount}${ing.unit}` : ''}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <button className={styles.addIngBtn} onClick={addUrl}>＋ 新增連結</button>

          <div className={styles.formSectionGap} />

          {/* INGREDIENTS */}
          <div className={styles.formSectionHeader}>食材</div>
          {settings.ingredient_categories.map(cat => (
            <div key={cat} className={styles.ingCatBlock}>
              <div className={styles.ingCatLabel}>{cat}</div>
              {(settings.common_ingredients[cat] || []).length > 0 && (
                <div className={styles.commonIngsRow}>
                  {(settings.common_ingredients[cat] || []).map(name => {
                    const added = (ingWithCats[cat] || []).some(x => x.name === name)
                    return (
                      <button key={name}
                        className={`${styles.commonIngChip} ${added ? styles.commonIngChipAdded : ''}`}
                        onClick={() => !added && addIngByName(cat, name)}>
                        {added ? '✓' : '+'} {name}
                      </button>
                    )
                  })}
                </div>
              )}
              {(ingWithCats[cat] || []).map((ing, i) => (
                <div key={i} className={styles.ingFormRow}>
                  <div style={{position:'relative',flex:2}}>
                    <input
                      className={styles.formInput}
                      value={ing.name}
                      placeholder={`${cat}名稱`}
                      onChange={e => { updateIng(cat,i,'name',e.target.value); showAC(cat,i,e.target.value) }}
                      onBlur={() => setTimeout(()=>setAcState(null),200)}
                      autoComplete="off"
                    />
                    {acState?.cat===cat && acState?.i===i && (
                      <div className={styles.acList}>
                        {acState.results.map(m => (
                          <div key={m} className={styles.acItem} onMouseDown={() => { updateIng(cat,i,'name',m); setAcState(null) }}>{m}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input className={styles.formInput} value={ing.amount} placeholder="數量" style={{flex:1,minWidth:60}} onChange={e => updateIng(cat,i,'amount',e.target.value)} />
                  <input className={styles.formInput} value={ing.unit} placeholder="單位" style={{flex:1,minWidth:50}} onChange={e => updateIng(cat,i,'unit',e.target.value)} />
                  <button className={styles.removeBtn} onClick={() => removeIng(cat,i)}>✕</button>
                </div>
              ))}
              <button className={styles.addIngBtn} onClick={() => addIng(cat)}>＋ 自訂{cat}</button>
            </div>
          ))}

          <div className={styles.formSectionGap} />

          {/* NOTE */}
          <div className={styles.formSectionHeader}>備注</div>
          <div className={styles.formSection}>
            <textarea className={styles.formTextarea} value={r.note}
              placeholder="步驟、心得、注意事項…"
              onChange={e => setField('note', e.target.value)} style={{minHeight:180}} />
          </div>

        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// SEARCH PANEL
// ──────────────────────────────────────────────
function SearchPanel({ recipes, settings, searchState, onSearchChange, onOpen }: {
  recipes: Recipe[], settings: AppSettings,
  searchState: any, onSearchChange: (s:any)=>void, onOpen: (id:number)=>void
}) {
  const results = recipes.filter(r => {
    if(searchState.query && !r.name.includes(searchState.query)) return false
    if(searchState.favOnly && !r.favorite) return false
    if(searchState.ingredients.length) {
      const all = Object.values(r.ingredients).flat().map((i:any)=>i.name)
      if(searchState.mode==='AND') { if(!searchState.ingredients.every((i:string)=>all.includes(i))) return false }
      else { if(!searchState.ingredients.some((i:string)=>all.includes(i))) return false }
    }
    for(const [type,vals] of Object.entries(searchState.tagFilters)) {
      if(!(vals as string[]).length) continue
      if(!(vals as string[]).some(v=>(r.tags[type]||[]).includes(v))) return false
    }
    return true
  })

  const toggleIng = (ing: string) => {
    const cur = searchState.ingredients
    onSearchChange({ ...searchState, ingredients: cur.includes(ing) ? cur.filter((i:string)=>i!==ing) : [...cur,ing] })
  }

  const toggleTagF = (type: string, val: string) => {
    const cur = searchState.tagFilters[type]||[]
    onSearchChange({ ...searchState, tagFilters: { ...searchState.tagFilters, [type]: cur.includes(val)?cur.filter((v:string)=>v!==val):[...cur,val] } })
  }

  return (
    <div>
      <div className={styles.topbar}><div className={styles.topbarTitle}>搜尋</div></div>
      <div className={styles.content}>
        <div className={styles.searchPanel}>
          <input className={styles.searchInputBig} placeholder="搜尋食譜名稱…" value={searchState.query}
            onChange={e => onSearchChange({...searchState, query:e.target.value})} />

          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>食材模式</span>
            <div className={styles.filterMode}>
              {(['OR','AND'] as const).map(m => (
                <button key={m} className={`${styles.filterModeBtn} ${searchState.mode===m?styles.filterModeBtnActive:''}`}
                  onClick={() => onSearchChange({...searchState,mode:m})}>{m==='OR'?'OR（任一）':'AND（全部）'}</button>
              ))}
            </div>
            <label style={{display:'flex',alignItems:'center',gap:5,fontSize:12,cursor:'pointer',color:'var(--text2)'}}>
              <input type="checkbox" checked={searchState.favOnly} onChange={e=>onSearchChange({...searchState,favOnly:e.target.checked})} /> 只看最愛
            </label>
          </div>

          {Object.entries(settings.tag_types).map(([type,vals])=>(
            <div key={type} className={styles.filterRow}>
              <span className={styles.filterLabel}>{type}</span>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {vals.map(v=>(
                  <button key={v} className={`${styles.tagChip} ${(searchState.tagFilters[type]||[]).includes(v)?styles.tagChipActive:''}`}
                    onClick={()=>toggleTagF(type,v)}>{v}{(searchState.tagFilters[type]||[]).includes(v)?' ✕':''}</button>
                ))}
              </div>
            </div>
          ))}

          {settings.ingredient_categories.map(cat => {
            const catIngs = (settings.common_ingredients[cat] || [])
            if (!catIngs.length) return null
            return (
              <div key={cat} className={styles.filterRow}>
                <span className={styles.filterLabel}>{cat}</span>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {catIngs.map(ing => (
                    <button key={ing} className={`${styles.tagChip} ${searchState.ingredients.includes(ing)?styles.tagChipActive:''}`}
                      onClick={()=>toggleIng(ing)}>{ing}{searchState.ingredients.includes(ing)?' ✕':''}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {(() => {
          const hasSearch = searchState.query || searchState.ingredients.length > 0 ||
            Object.values(searchState.tagFilters).flat().length > 0 || searchState.favOnly
          if (!hasSearch) return null
          if (results.length === 0) return (
            <div className={styles.emptyState}><div className={styles.emptyIcon}><SearchIcon /></div><p>沒有符合條件的食譜</p></div>
          )
          return results.map(r => (
            <div key={r.id} className={styles.resultCard} onClick={() => onOpen(r.id)}>
              <div className={styles.resultCardName}>{r.name} {r.favorite ? <span style={{display:'inline-flex',alignItems:'center',verticalAlign:'middle'}}><FavHeartIcon filled={true} /></span> : null}</div>
              <div className={styles.resultCardMeta}>
                <span>{r.servings}人份</span>
                {Object.values(r.tags||{}).flat().map(t=><span key={t} className={styles.tagBadge} style={{fontSize:11}}>{t}</span>)}
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// SETTINGS PANEL
// ──────────────────────────────────────────────
function SettingsPanel({ settings, onSave }: { settings: AppSettings, onSave: (s:AppSettings)=>void }) {
  const [s, setS] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)))
  const [newType, setNewType] = useState('')
  const [newTagVals, setNewTagVals] = useState<Record<string,string>>({})
  const [newCat, setNewCat] = useState('')
  const [newIngs, setNewIngs] = useState<Record<string,string>>({})
  const [editingType, setEditingType] = useState<string|null>(null)
  const [editingTypeVal, setEditingTypeVal] = useState('')

  const saveTypeName = (oldType: string) => {
    const newName = editingTypeVal.trim()
    if (!newName || newName === oldType) { setEditingType(null); return }
    if (s.tag_types[newName]) { setEditingType(null); return }
    const next: Record<string,string[]> = {}
    for (const [k, v] of Object.entries(s.tag_types)) next[k === oldType ? newName : k] = v
    commit({...s, tag_types: next})
    setEditingType(null)
  }

  const commit = (next: AppSettings) => { setS(next); onSave(next) }

  return (
    <div>
      <div className={styles.topbar}><div className={styles.topbarTitle}>設定</div></div>
      <div className={styles.content}>

        {/* TAG TYPES */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsTitle}><TagIcon /> Tag 管理</div>
          {Object.entries(s.tag_types).map(([type,vals], idx)=>{
            const isBlue = idx % 2 === 0
            const blockStyle = isBlue
              ? {background:'var(--info-bg)', border:'0.5px solid var(--accent-light)'}
              : {background:'var(--amber-bg)', border:'0.5px solid #E8C840'}
            return (
            <div key={type} className={styles.tagGroupBlock} style={blockStyle}>
              <div className={styles.tagGroupName}>
                {editingType === type ? (
                  <div style={{display:'flex',gap:6,flex:1,alignItems:'center'}}>
                    <input className={styles.formInput} style={{flex:1,fontSize:13,padding:'4px 8px'}}
                      value={editingTypeVal} autoFocus
                      onChange={e=>setEditingTypeVal(e.target.value)}
                      onKeyDown={e=>{ if(e.key==='Enter') saveTypeName(type); if(e.key==='Escape') setEditingType(null) }} />
                    <button className={`${styles.btn} ${styles.btnPrimary}`} style={{padding:'4px 8px',fontSize:11}} onClick={()=>saveTypeName(type)}>✓</button>
                    <button className={styles.btn} style={{padding:'4px 8px',fontSize:11}} onClick={()=>setEditingType(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <span>{type}</span>
                    <div style={{display:'flex',gap:6}}>
                      <button className={styles.btn} style={{padding:'4px 8px',fontSize:11}}
                        onClick={()=>{setEditingType(type);setEditingTypeVal(type)}}>改名</button>
                      <button className={`${styles.btn} ${styles.btnDanger}`} style={{padding:'4px 8px',fontSize:11}}
                        onClick={()=>{ const n={...s.tag_types}; delete n[type]; commit({...s,tag_types:n}) }}>刪除</button>
                    </div>
                  </>
                )}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                {vals.map(v=>(
                  <span key={v} className={styles.settingChip}>
                    {v}
                    <button className={styles.xBtn} onClick={()=>commit({...s,tag_types:{...s.tag_types,[type]:vals.filter(x=>x!==v)}})}>✕</button>
                  </span>
                ))}
              </div>
              <div className={styles.settingRow}>
                <input className={styles.formInput} style={{flex:1}} placeholder="新增 tag 值…"
                  value={newTagVals[type]||''} onChange={e=>setNewTagVals(p=>({...p,[type]:e.target.value}))}
                  onKeyDown={e=>{ if(e.key==='Enter'){ const v=(newTagVals[type]||'').trim(); if(v&&!vals.includes(v)){ commit({...s,tag_types:{...s.tag_types,[type]:[...vals,v]}}); setNewTagVals(p=>({...p,[type]:''})) } } }} />
                <button className={styles.btn} onClick={()=>{ const v=(newTagVals[type]||'').trim(); if(v&&!vals.includes(v)){ commit({...s,tag_types:{...s.tag_types,[type]:[...vals,v]}}); setNewTagVals(p=>({...p,[type]:''})) } }}>＋ 新增</button>
              </div>
            </div>
          )})}

          <div className={styles.settingRow} style={{marginTop:12}}>
            <input className={styles.formInput} style={{flex:1}} placeholder="新增 tag 類型名稱…" value={newType}
              onChange={e=>setNewType(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&newType.trim()&&!s.tag_types[newType.trim()]){ commit({...s,tag_types:{...s.tag_types,[newType.trim()]:[]}}); setNewType('') } }} />
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>{ const v=newType.trim(); if(v&&!s.tag_types[v]){ commit({...s,tag_types:{...s.tag_types,[v]:[]}}); setNewType('') } }}>＋ 新增類型</button>
          </div>
        </div>

        {/* INGREDIENT CATEGORIES */}
        <div className={styles.settingsPanel}>
          <div className={styles.settingsTitle}><LeafIcon /> 食材分類與常見食材</div>
          {s.ingredient_categories.map(cat=>(
            <div key={cat} className={styles.tagGroupBlock}>
              <div className={styles.tagGroupName}>
                <span>{cat}</span>
                <button className={`${styles.btn} ${styles.btnDanger}`} style={{padding:'4px 8px',fontSize:11}}
                  onClick={()=>commit({...s,ingredient_categories:s.ingredient_categories.filter(c=>c!==cat)})}>刪除分類</button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                {(s.common_ingredients[cat]||[]).map(v=>(
                  <span key={v} className={styles.settingChip}>
                    {v}
                    <button className={styles.xBtn} onClick={()=>commit({...s,common_ingredients:{...s.common_ingredients,[cat]:(s.common_ingredients[cat]||[]).filter(x=>x!==v)}})}>✕</button>
                  </span>
                ))}
              </div>
              <div className={styles.settingRow}>
                <input className={styles.formInput} style={{flex:1}} placeholder="新增常見食材…"
                  value={newIngs[cat]||''} onChange={e=>setNewIngs(p=>({...p,[cat]:e.target.value}))}
                  onKeyDown={e=>{ if(e.key==='Enter'){ const v=(newIngs[cat]||'').trim(); const cur=s.common_ingredients[cat]||[]; if(v&&!cur.includes(v)){ commit({...s,common_ingredients:{...s.common_ingredients,[cat]:[...cur,v]}}); setNewIngs(p=>({...p,[cat]:''})) } } }} />
                <button className={styles.btn} onClick={()=>{ const v=(newIngs[cat]||'').trim(); const cur=s.common_ingredients[cat]||[]; if(v&&!cur.includes(v)){ commit({...s,common_ingredients:{...s.common_ingredients,[cat]:[...cur,v]}}); setNewIngs(p=>({...p,[cat]:''})) } }}>＋ 新增</button>
              </div>
            </div>
          ))}
          <div className={styles.settingRow} style={{marginTop:12}}>
            <input className={styles.formInput} style={{flex:1}} placeholder="新增食材分類名稱…" value={newCat}
              onChange={e=>setNewCat(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&newCat.trim()&&!s.ingredient_categories.includes(newCat.trim())){ commit({...s,ingredient_categories:[...s.ingredient_categories,newCat.trim()],common_ingredients:{...s.common_ingredients,[newCat.trim()]:[]}}); setNewCat('') } }} />
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>{ const v=newCat.trim(); if(v&&!s.ingredient_categories.includes(v)){ commit({...s,ingredient_categories:[...s.ingredient_categories,v],common_ingredients:{...s.common_ingredients,[v]:[]}}); setNewCat('') } }}>＋ 新增分類</button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Helpers ──
function timeAgo(ts: string) {
  const d = Date.now() - new Date(ts).getTime()
  if(d < 60000) return '剛剛'
  if(d < 3600000) return Math.floor(d/60000) + ' 分鐘前'
  if(d < 86400000) return Math.floor(d/3600000) + ' 小時前'
  if(d < 2592000000) return Math.floor(d/86400000) + ' 天前'
  return Math.floor(d/2592000000) + ' 個月前'
}

function parseIngredientsFromText(text: string): { name: string; amount: string; unit: string }[] {
  if (!text) return []
  const units = ['公克','毫升','大匙','小匙','公升','克','ml','個','根','片','匙','杯','斤','兩','碗','條','顆','包','罐','塊','把','瓣','段','滴','份','隻','支','束','適量','少許','g','G']
  const unitPat = units.join('|')
  const results: { name: string; amount: string; unit: string }[] = []
  const seen = new Set<string>()
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[•·*\-▸►◆○●■□▷→\s]+/, '')
    if (!trimmed || trimmed.length > 30) continue
    const m = trimmed.match(new RegExp(`^([一-鿿\\w\\s（）()]{1,10}?)\\s*(\\d+(?:[./]\\d+)?)\\s*(${unitPat})`))
    if (m) {
      const name = m[1].trim()
      if (name.length >= 1 && !seen.has(name)) {
        seen.add(name)
        results.push({ name, amount: m[2], unit: m[3] })
      }
    }
  }
  return results
}

// ──────────────────────────────────────────────
// RECIPE GRID (所有食譜 / 我的最愛 preview)
// ──────────────────────────────────────────────
function RecipeGrid({ recipes, onOpen }: { recipes: Recipe[], onOpen: (id: number) => void }) {
  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}><PotIcon /></div>
        <p>還沒有食譜<br />點擊「新增食譜」開始建立</p>
      </div>
    )
  }
  return (
    <div className={styles.content}>
      <div className={styles.recipeGrid}>
        {recipes.map(r => (
          <div key={r.id} className={styles.recipeCard} onClick={() => onOpen(r.id)}>
            <div className={styles.recipeCardName}>{r.name}</div>
            <div className={styles.recipeCardTags}>
              {Object.values(r.tags || {}).flat().map(t => (
                <span key={t} className={styles.tagBadge} style={{fontSize:10}}>{t}</span>
              ))}
            </div>
            <div className={styles.recipeCardMeta}>
              <span>{r.servings}人份</span>
              {r.favorite && <FavHeartIcon filled={true} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function levenshtein(a: string, b: string): number {
  const m=a.length, n=b.length
  const dp = Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0))
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++)
    dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1])
  return dp[m][n]
}
