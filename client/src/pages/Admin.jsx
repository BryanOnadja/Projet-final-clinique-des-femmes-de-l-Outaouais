// Administration : notes rapides, services et comptes de l'équipe.
import { useEffect, useState } from 'react'
import { api } from '../api'
import { STATUTS } from '../constantes'
import { useLangue } from '../i18n'

export default function Admin() {
  const [onglet, setOnglet] = useState('notes')
  const { t } = useLangue()
  return (
    <>
      <h1 className="title is-4">{t('admin.titre')}</h1>
      <div className="tabs is-boxed">
        <ul>
          <li className={onglet === 'notes' ? 'is-active' : ''}><a onClick={() => setOnglet('notes')}>{t('admin.notes')}</a></li>
          <li className={onglet === 'services' ? 'is-active' : ''}><a onClick={() => setOnglet('services')}>{t('admin.services')}</a></li>
          <li className={onglet === 'comptes' ? 'is-active' : ''}><a onClick={() => setOnglet('comptes')}>{t('admin.comptes')}</a></li>
        </ul>
      </div>
      {onglet === 'notes' && <NotesRapides />}
      {onglet === 'services' && <Services />}
      {onglet === 'comptes' && <Comptes />}
    </>
  )
}

function Message({ texte, erreur }) {
  const { tErreur } = useLangue()
  if (!texte) return null
  return <p className={`notification is-light py-2 ${erreur ? 'is-danger' : 'is-success'}`}>{erreur ? tErreur(texte) : texte}</p>
}

function SelectStatut({ valeur, onChange }) {
  const { t } = useLangue()
  return (
    <div className="select is-small is-fullwidth">
      <select value={valeur || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{t('admin.neChangePas')}</option>
        {Object.keys(STATUTS).map((v) => <option key={v} value={v}>{t(`statut.${v}`)}</option>)}
      </select>
    </div>
  )
}

// ---------- Notes rapides ----------
function NotesRapides() {
  const { t } = useLangue()
  const [notes, setNotes] = useState([])
  const [nouvelle, setNouvelle] = useState({ texte: '', statut_resultant: null })
  const [message, setMessage] = useState({})

  const charger = () => api('/notes-rapides?tous=1').then(setNotes)
  useEffect(() => { charger() }, [])

  const modifierLocal = (id, cle, valeur) => setNotes(notes.map((n) => (n.id === id ? { ...n, [cle]: valeur } : n)))

  async function enregistrer(n) {
    try {
      await api(`/notes-rapides/${n.id}`, { methode: 'PATCH', corps: n })
      setMessage({ texte: t('admin.noteEnregistree') })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/notes-rapides', { methode: 'POST', corps: nouvelle })
      setNouvelle({ texte: '', statut_resultant: null })
      setMessage({ texte: t('admin.noteAjoutee') })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <p className="mb-4 has-text-grey">{t('admin.notesAide')}</p>
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th style={{ width: 70 }}>{t('admin.ordre')}</th><th>{t('admin.texte')}</th><th style={{ width: 240 }}>{t('admin.statutDonne')}</th><th>{t('admin.active')}</th><th /></tr></thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id} className={n.actif ? '' : 'has-text-grey-light'}>
              <td><input className="input is-small" type="number" value={n.ordre} onChange={(e) => modifierLocal(n.id, 'ordre', e.target.value)} /></td>
              <td><input className="input is-small" value={n.texte} onChange={(e) => modifierLocal(n.id, 'texte', e.target.value)} /></td>
              <td><SelectStatut valeur={n.statut_resultant} onChange={(v) => modifierLocal(n.id, 'statut_resultant', v)} /></td>
              <td><input type="checkbox" checked={!!n.actif} onChange={(e) => modifierLocal(n.id, 'actif', e.target.checked)} aria-label={t('admin.active')} /></td>
              <td><button className="button is-small is-primary" onClick={() => enregistrer(n)}>{t('admin.enregistrer')}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={ajouter} className="columns is-variable is-2 mt-2">
        <div className="column"><input className="input is-small" placeholder={t('admin.nouvelleNote')} value={nouvelle.texte} onChange={(e) => setNouvelle({ ...nouvelle, texte: e.target.value })} /></div>
        <div className="column is-3"><SelectStatut valeur={nouvelle.statut_resultant} onChange={(v) => setNouvelle({ ...nouvelle, statut_resultant: v })} /></div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">{t('admin.ajouter')}</button></div>
      </form>
    </div>
  )
}

// ---------- Services ----------
function Services() {
  const { t } = useLangue()
  const [services, setServices] = useState([])
  const [nouveau, setNouveau] = useState({ nom: '', couleur: '#3e8ed0' })
  const [message, setMessage] = useState({})

  const charger = () => api('/services').then(setServices)
  useEffect(() => { charger() }, [])

  const modifierLocal = (id, cle, valeur) => setServices(services.map((s) => (s.id === id ? { ...s, [cle]: valeur } : s)))

  async function enregistrer(s) {
    try {
      await api(`/services/${s.id}`, { methode: 'PATCH', corps: s })
      setMessage({ texte: t('admin.serviceEnregistre') })
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/services', { methode: 'POST', corps: nouveau })
      setNouveau({ nom: '', couleur: '#3e8ed0' })
      setMessage({ texte: t('admin.serviceAjoute') })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <p className="mb-4 has-text-grey">{t('admin.servicesAide')}</p>
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th>{t('admin.nom')}</th><th style={{ width: 120 }}>{t('admin.couleur')}</th><th /></tr></thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td><input className="input is-small" value={s.nom} onChange={(e) => modifierLocal(s.id, 'nom', e.target.value)} /></td>
              <td><input type="color" value={s.couleur} onChange={(e) => modifierLocal(s.id, 'couleur', e.target.value)} aria-label={t('admin.couleur')} /></td>
              <td><button className="button is-small is-primary" onClick={() => enregistrer(s)}>{t('admin.enregistrer')}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={ajouter} className="columns is-variable is-2 mt-2">
        <div className="column"><input className="input is-small" placeholder={t('admin.nouveauService')} value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} /></div>
        <div className="column is-narrow"><input type="color" value={nouveau.couleur} onChange={(e) => setNouveau({ ...nouveau, couleur: e.target.value })} aria-label={t('admin.couleur')} /></div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">{t('admin.ajouter')}</button></div>
      </form>
    </div>
  )
}

// ---------- Comptes ----------
function Comptes() {
  const { t } = useLangue()
  const [comptes, setComptes] = useState([])
  const [nouveau, setNouveau] = useState({ nom: '', courriel: '', mot_de_passe: '', role: 'membre' })
  const [message, setMessage] = useState({})

  const charger = () => api('/utilisateurs').then(setComptes)
  useEffect(() => { charger() }, [])

  async function modifier(id, corps) {
    try {
      await api(`/utilisateurs/${id}`, { methode: 'PATCH', corps })
      setMessage({ texte: t('admin.compteMaj') })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  async function ajouter(e) {
    e.preventDefault()
    try {
      await api('/utilisateurs', { methode: 'POST', corps: nouveau })
      setNouveau({ nom: '', courriel: '', mot_de_passe: '', role: 'membre' })
      setMessage({ texte: t('admin.compteCree') })
      charger()
    } catch (err) { setMessage({ texte: err.message, erreur: true }) }
  }

  return (
    <div className="box">
      <Message {...message} />
      <table className="table is-fullwidth">
        <thead><tr><th>{t('admin.nom')}</th><th>{t('admin.courriel')}</th><th>{t('admin.role')}</th><th>{t('admin.acces')}</th></tr></thead>
        <tbody>
          {comptes.map((c) => (
            <tr key={c.id} className={c.actif ? '' : 'has-text-grey-light'}>
              <td>{c.nom}</td>
              <td>{c.courriel}</td>
              <td>
                <div className="select is-small">
                  <select value={c.role} onChange={(e) => modifier(c.id, { role: e.target.value })}>
                    <option value="membre">{t('admin.membre')}</option>
                    <option value="admin">{t('admin.administratrice')}</option>
                  </select>
                </div>
              </td>
              <td>
                <button className={`button is-small ${c.actif ? 'is-light' : 'is-warning'}`} onClick={() => modifier(c.id, { actif: !c.actif })}>
                  {c.actif ? t('admin.desactiver') : t('admin.reactiver')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="subtitle is-6 has-text-weight-semibold mt-5">{t('admin.ajouterCompte')}</h2>
      <form onSubmit={ajouter} className="columns is-variable is-2 is-multiline">
        <div className="column is-3"><input className="input is-small" placeholder={t('admin.nom')} required value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} /></div>
        <div className="column is-3"><input className="input is-small" type="email" placeholder={t('admin.courriel')} required value={nouveau.courriel} onChange={(e) => setNouveau({ ...nouveau, courriel: e.target.value })} /></div>
        <div className="column is-3"><input className="input is-small" type="password" placeholder={t('admin.mdpMin')} required value={nouveau.mot_de_passe} onChange={(e) => setNouveau({ ...nouveau, mot_de_passe: e.target.value })} /></div>
        <div className="column is-narrow">
          <div className="select is-small">
            <select value={nouveau.role} onChange={(e) => setNouveau({ ...nouveau, role: e.target.value })}>
              <option value="membre">{t('admin.membre')}</option>
              <option value="admin">{t('admin.administratrice')}</option>
            </select>
          </div>
        </div>
        <div className="column is-narrow"><button className="button is-small is-link" type="submit">{t('admin.creer')}</button></div>
      </form>
    </div>
  )
}
