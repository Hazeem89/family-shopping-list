import { useAuth } from './hooks/useAuth'
import { useFamily } from './hooks/useFamily'
import { useItems } from './hooks/useItems'
import AuthPage from './components/auth/AuthPage'
import FamilySetup from './components/family/FamilySetup'
import Header from './components/Header'
import AddItemForm from './components/AddItemForm'
import ItemList from './components/ItemList'
import ActivityFeed from './components/ActivityFeed'

export default function App() {
  const { user, profile, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { family, memberCount, loading: familyLoading, createFamily, joinFamily } = useFamily(user, authLoading)
  const { items, activity, newItemId, loading: itemsLoading, error, setError, addItem, toggleItem, deleteItem } = useItems(family, user)

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen bg-orange-100 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) return <AuthPage onSignIn={signIn} onSignUp={signUp} />
  if (!family) return <FamilySetup onCreate={createFamily} onJoin={joinFamily} />

  const username = profile?.full_name ?? user.email

  return (
    <div className="min-h-screen bg-orange-100 py-4 px-3 sm:py-8 sm:px-4">
      <div className="w-full max-w-lg mx-auto">
        <Header
          familyName={family.name}
          username={username}
          memberCount={memberCount}
          inviteCode={family.invite_code}
          isAdmin={family.role === 'admin'}
          onSignOut={signOut}
        />
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3">✕</button>
          </div>
        )}
        <AddItemForm onAdd={addItem} />
        {itemsLoading
          ? <p className="text-center text-stone-400 text-sm py-6">Loading items...</p>
          : <ItemList items={items} newItemId={newItemId} onToggle={toggleItem} onDelete={deleteItem} />
        }
        <ActivityFeed activity={activity} />
      </div>
    </div>
  )
}
