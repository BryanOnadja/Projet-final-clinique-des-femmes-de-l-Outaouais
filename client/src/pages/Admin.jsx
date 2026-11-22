// Administration : notes rapides, services et comptes de l'équipe.
import { useEffect, useState } from 'react'
import { api } from '../api'
import { STATUTS } from '../constantes'

export default function Admin() {
  const [onglet, setOnglet] = useState('notes')
  return (
    <>
      <h1 className="title is-4">Administration</h1>
      <div className="tabs is-boxed">
        <ul>
          <li className={onglet === 'notes' ? 'is-active' : ''}><a onClick={() => setOnglet('notes')}>Notes rapides</a></li>
          <li className={onglet === 'services' ? 'is-active' : ''}><a onClick={() => setOnglet('services')}>Services</a></li>
          <li className={onglet === 'comptes' ? 'is-active' : ''}><a onClick={() => setOnglet('comptes')}>Comptes de l'équipe</a></li>
        </ul>
      </div>
      {onglet === 'notes' && <NotesRapides />}
      {onglet === 'services' && <Services />}
      {onglet === 'comptes' && <Comptes />}
    </>
  )
}

function Message({ texte, erreur }) {
  if (!texte) return null
  return <p className={`notification is-light py-2 ${erreur ? 'is-danger' : 'is-success'}`}>{texte}</p>
}

function SelectStatut({ valeur, onChange }) {
  return (
    <div className="select is-small is-fullwidth">
      <select value={valeur || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">Ne change pas le statut</option>
        {Object.entries(STATUTS).map(([v, s]) => <option key={v} value={v}>{s.libelle}</option>)}
      </select>
    </div>
  )
}

// ---------- Notes rapides ----------
function NotesRapides() {
  const [notes, setNotes] = useState([])
  const [nouvelle, setNouvelle] = useState({ texte: '', statut_resultant: null })
  const [message, setMessage] = useState({})

  const charger = () => api('/notes-rapides?tous=1').then(setNotes)
  useEffect(() => { charger() }, [])

  const modifierLocal = (id, cle, valeur) => setNotes(notes.map((n) => (n.id === id ? { ...n, [cle]: valeur } : n)))

  async function enregistrer(n) {
    try {
      await api(`/notes-rapides/${n.id}`, { methode: 'PATCH', corps: n })
      setMessage({ texte: 'Note enregistrée : les boutons sont mis à jour chez toute l\'équipe.' })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/notes-rapides', { methode: 'POST', corps: nouvelle })
      setNouvelle({ texte: '', statut_resultant: null })
      setMessage({ texte: 'Note ajoutée.' })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <p className="mb-4 has-text-grey">Ces textes apparaissent comme boutons sur chaque fiche d'appel. Le statut choisi est appliqué à l'appel quand on clique sur la note.</p>
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th style={{ width: 70 }}>Ordre</th><th>Texte</th><th style={{ width: 220 }}>Statut donné à l'appel</th><th>Active</th><th /></tr></thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id} className={n.actif ? '' : 'has-text-grey-light'}>
              <td><input className="input is-small" type="number" value={n.ordre} onChange={(e) => modifierLocal(n.id, 'ordre', e.target.value)} /></td>
              <td><input className="input is-small" value={n.texte} onChange={(e) => modifierLocal(n.id, 'texte', e.target.value)} /></td>
              <td><SelectStatut valeur={n.statut_resultant} onChange={(v) => modifierLocal(n.id, 'statut_resultant', v)} /></td>
              <td><input type="checkbox" checked={!!n.actif} onChange={(e) => modifierLocal(n.id, 'actif', e.target.checked)} aria-label="Active" /></td>
              <td><button className="button is-small is-primary" onClick={() => enregistrer(n)}>Enregistrer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={ajouter} className="columns is-variable is-2 mt-2">
        <div className="column"><input className="input is-small" placeholder="Nouvelle note rapide" value={nouvelle.texte} onChange={(e) => setNouvelle({ ...nouvelle, texte: e.target.value })} /></div>
        <div className="column is-3"><SelectStatut valeur={nouvelle.statut_resultant} onChange={(v) => setNouvelle({ ...nouvelle, statut_resultant: v })} /></div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">Ajouter</button></div>
      </form>
    </div>
  )
}

// ---------- Services ----------
function Services() {
  const [services, setServices] = useState([])
  const [nouveau, setNouveau] = useState({ nom: '', couleur: '#3e8ed0' })
  const [message, setMessage] = useState({})

  const charger = () => api('/services').then(setServices)
  useEffect(() => { charger() }, [])

  const modifierLocal = (id, cle, valeur) => setServices(services.map((s) => (s.id === id ? { ...s, [cle]: valeur } : s)))

  async function enregistrer(s) {
    try {
      await api(`/services/${s.id}`, { methode: 'PATCH', corps: s })
      setMessage({ texte: 'Service enregistré.' })
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/services', { methode: 'POST', corps: nouveau })
      setNouveau({ nom: '', couleur: '#3e8ed0' })
      setMessage({ texte: 'Service ajouté.' })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <p className="mb-4 has-text-grey">Les services servent aux filtres et donnent sa couleur à chaque appel.</p>
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th>Nom</th><th style={{ width: 120 }}>Couleur</th><th /></tr></thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td><input className="input is-small" value={s.nom} onChange={(e) => modifierLocal(s.id, 'nom', e.target.value)} /></td>
              <td><input type="color" value={s.couleur} onChange={(e) => modifierLocal(s.id, 'couleur', e.target.value)} aria-label="Couleur" /></td>
              <td><button className="button is-small is-primary" onClick={() => enregistrer(s)}>Enregistrer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={ajouter} className="columns is-variable is-2 mt-2">
        <div className="column"><input className="input is-small" placeholder="Nouveau service" value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} /></div>
        <div className="column is-narrow"><input type="color" value={nouveau.couleur} onChange={(e) => setNouveau({ ...nouveau, couleur: e.target.value })} aria-label="Couleur" /></div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">Ajouter</button></div>
      </form>
    </div>
  )
}

// ---------- Comptes ----------
function Comptes() {
  const [comptes, setComptes] = useState([])
  const [nouveau, setNouveau] = useState({ nom: '', courriel: '', mot_de_passe: '', role: 'membre' })
  const [message, setMessage] = useState({})

  const charger = () => api('/utilisateurs').then(setComptes)
  useEffect(() => { charger() }, [])

  async function modifier(id, corps) {
    try {
      await api(`/utilisateurs/${id}`, { methode: 'PATCH', corps })
      setMessage({ texte: 'Compte mis à jour.' })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/utilisateurs', { methode: 'POST', corps: nouveau })
      setNouveau({ nom: '', courriel: '', mot_de_passe: '', role: 'membre' })
      setMessage({ texte: 'Compte créé.' })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th>Nom</th><th>Courriel</th><th>Rôle</th><th>Accès</th></tr></thead>
        <tbody>
          {comptes.map((c) => (
            <tr key={c.id} className={c.actif ? '' : 'has-text-grey-light'}>
              <td>{c.nom}</td>
              <td>{c.courriel}</td>
              <td>
                <div className="select is-small">
                  <select value={c.role} onChange={(e) => modifier(c.id, { role: e.target.value })}>
                    <option value="membre">Membre</option>
                    <option value="admin">Administratrice</option>
                  </select>
                </div>
              </td>
              <td>
                <button className={`button is-small ${c.actif ? 'is-light' : 'is-warning'}`} onClick={() => modifier(c.id, { actif: !c.actif })}>
                  {c.actif ? 'Désactiver' : 'Réactiver'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="subtitle is-6 has-text-weight-semibold mt-5">Ajouter un compte</h2>
      <form onSubmit={ajouter} className="columns is-variable is-2 is-multiline">
        <div className="column is-3"><input className="input is-small" placeholder="Nom" required value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} /></div>
        <div className="column is-3"><input className="input is-small" type="email" placeholder="Courriel" required value={nouveau.courriel} onChange={(e) => setNouveau({ ...nouveau, courriel: e.target.value })} /></div>
        <div className="column is-3"><input className="input is-small" type="password" placeholder="Mot de passe (8 caractères min.)" required value={nouveau.mot_de_passe} onChange={(e) => setNouveau({ ...nouveau, mot_de_passe: e.target.value })} /></div>
        <div className="column is-narrow">
          <div className="select is-small">
            <select value={nouveau.role} onChange={(e) => setNouveau({ ...nouveau, role: e.target.value })}>
              <option value="membre">Membre</option>
              <option value="admin">Administratrice</option>
            </select>
          </div>
        </div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">Créer</button></div>
      </form>
    </div>
  )
}
