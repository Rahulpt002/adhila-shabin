import { useEffect, useRef, useState, type FormEvent } from 'react'
import { wedding } from '../config/wedding'
import { formatLongDate } from '../lib/date'
import { effectiveMode, submitRsvp, type SubmitOutcome } from '../rsvp/submit'
import { SectionHeading } from './SectionHeading'

interface Values {
  name: string
  attending: '' | 'yes' | 'no'
  guests: string
  dietary: string
  message: string
  /** Honeypot: hidden from people, often filled by bots. */
  website: string
}

type Errors = Partial<Record<'name' | 'attending' | 'guests' | 'dietary' | 'message', string>>

const EMPTY: Values = { name: '', attending: '', guests: '1', dietary: '', message: '', website: '' }

function validate(v: Values): Errors {
  const e: Errors = {}
  const name = v.name.trim()
  if (!name) e.name = 'Please enter your name.'
  else if (name.length < 2) e.name = 'Please enter your full name.'
  else if (name.length > 80) e.name = 'Please keep your name under 80 characters.'
  if (!v.attending) e.attending = 'Please let us know whether you can attend.'
  const guests = Number(v.guests)
  if (v.attending === 'yes' && (!Number.isInteger(guests) || guests < 1 || guests > wedding.rsvp.maxGuests))
    e.guests = `Please choose between 1 and ${wedding.rsvp.maxGuests}.`
  if (v.dietary.length > 200) e.dietary = 'Please keep this under 200 characters.'
  if (v.message.length > 500) e.message = `Please keep your message under 500 characters (${v.message.length} now).`
  return e
}

const FIELD_ORDER = ['name', 'attending', 'guests', 'dietary', 'message'] as const

export function RSVPForm() {
  const { rsvp, groom, bride } = wedding
  const mode = effectiveMode()
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [outcome, setOutcome] = useState<{ kind: SubmitOutcome; name: string; attending: boolean } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outcome) resultRef.current?.focus()
  }, [outcome])

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    // Clear a field's error as soon as it is corrected.
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    const found = validate(values)
    setErrors(found)
    const firstInvalid = FIELD_ORDER.find((f) => found[f])
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)?.focus()
      return
    }
    if (values.website) {
      // Bot filled the honeypot: pretend nothing happened.
      setValues(EMPTY)
      return
    }
    setStatus('submitting')
    const attending = values.attending === 'yes'
    try {
      const kind = await submitRsvp({
        name: values.name.trim(),
        attending: attending ? 'yes' : 'no',
        guests: attending ? Number(values.guests) : 0,
        dietary: attending ? values.dietary.trim() : '',
        message: values.message.trim(),
        submittedAt: new Date().toISOString(),
      })
      setOutcome({ kind, name: values.name.trim().split(/\s+/)[0], attending })
      setValues(EMPTY)
      setStatus('idle')
    } catch (err) {
      console.error('[RSVP]', err)
      setStatus('error')
    }
  }

  const describedBy = (field: keyof Errors, hint?: string) =>
    [hint, errors[field] ? `rsvp-${field}-error` : null].filter(Boolean).join(' ') || undefined

  const errorText = (field: keyof Errors) =>
    errors[field] ? (
      <p className="field__error" id={`rsvp-${field}-error`}>
        {errors[field]}
      </p>
    ) : null

  let content
  if (mode === 'closed' || mode === 'unconfigured') {
    content = (
      <div className="rsvp-card rsvp-note" data-reveal>
        <p>
          {mode === 'closed'
            ? 'RSVPs are now closed. Thank you to everyone who replied!'
            : 'Online RSVP is not available yet. Please reply to the family directly — we would love to hear from you.'}
        </p>
      </div>
    )
  } else if (outcome) {
    content = (
      <div className="rsvp-card rsvp-result" ref={resultRef} tabIndex={-1} role="status" data-reveal>
        <p className="rsvp-result__title">
          {outcome.kind === 'whatsapp' ? 'Almost there' : outcome.attending ? 'Jazakallah khair' : 'Thank you'}, {outcome.name}
        </p>
        {outcome.kind === 'saved' && (
          <p>
            {outcome.attending
              ? `Your response has been received. ${groom.firstName} & ${bride.firstName} can't wait to celebrate with you.`
              : 'Your response has been received. You will be missed — thank you for your duas.'}
          </p>
        )}
        {outcome.kind === 'whatsapp' && (
          <p>WhatsApp has opened with your reply written out. Please press send there to deliver it to the family.</p>
        )}
        {outcome.kind === 'preview' && (
          <p>
            This invitation is in <strong>preview mode</strong>, so your reply was <strong>not sent</strong> to the
            family. Please let them know directly.
          </p>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => setOutcome(null)}>
          Send another response
        </button>
      </div>
    )
  } else {
    const submitting = status === 'submitting'
    content = (
      <form ref={formRef} className="rsvp-card rsvp-form" onSubmit={onSubmit} noValidate data-reveal aria-busy={submitting}>
        {mode === 'preview' && (
          <p className="rsvp-form__preview" role="note">
            Preview mode — replies are not being collected yet.
          </p>
        )}

        <div className="field">
          <label className="field__label" htmlFor="rsvp-name">
            Your name
          </label>
          <input
            id="rsvp-name"
            data-field="name"
            className="field__input"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy('name')}
            required
          />
          {errorText('name')}
        </div>

        <fieldset className="field field--choices" aria-describedby={describedBy('attending')}>
          <legend className="field__label">Will you join us?</legend>
          <div className="choices">
            {(
              [
                ['yes', 'Joyfully accepts'],
                ['no', 'Regretfully declines'],
              ] as const
            ).map(([value, label], idx) => (
              <label className={`choice ${values.attending === value ? 'is-checked' : ''}`} key={value}>
                <input
                  type="radio"
                  name="attending"
                  value={value}
                  data-field={idx === 0 ? 'attending' : undefined}
                  checked={values.attending === value}
                  onChange={() => set('attending', value)}
                  aria-invalid={!!errors.attending}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {errorText('attending')}
        </fieldset>

        {values.attending === 'yes' && rsvp.maxGuests > 1 && (
          <div className="field">
            <label className="field__label" htmlFor="rsvp-guests">
              Number of guests
            </label>
            <select
              id="rsvp-guests"
              data-field="guests"
              className="field__input"
              value={values.guests}
              onChange={(e) => set('guests', e.target.value)}
              aria-invalid={!!errors.guests}
              aria-describedby={describedBy('guests', 'rsvp-guests-hint')}
            >
              {Array.from({ length: rsvp.maxGuests }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'person' : 'people'}
                </option>
              ))}
            </select>
            <p className="field__hint" id="rsvp-guests-hint">
              Including yourself.
            </p>
            {errorText('guests')}
          </div>
        )}

        {values.attending === 'yes' && rsvp.askDietary && (
          <div className="field">
            <label className="field__label" htmlFor="rsvp-dietary">
              Dietary requirements <span className="field__optional">(optional)</span>
            </label>
            <input
              id="rsvp-dietary"
              data-field="dietary"
              className="field__input"
              type="text"
              value={values.dietary}
              onChange={(e) => set('dietary', e.target.value)}
              aria-invalid={!!errors.dietary}
              aria-describedby={describedBy('dietary')}
            />
            {errorText('dietary')}
          </div>
        )}

        <div className="field">
          <label className="field__label" htmlFor="rsvp-message">
            A message for the couple <span className="field__optional">(optional)</span>
          </label>
          <textarea
            id="rsvp-message"
            data-field="message"
            className="field__input field__input--area"
            rows={4}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy('message')}
          />
          {errorText('message')}
        </div>

        <div className="field--honeypot" aria-hidden="true">
          <label htmlFor="rsvp-website">Website</label>
          <input
            id="rsvp-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </div>

        {status === 'error' && (
          <p className="rsvp-form__error" role="alert">
            We couldn't send your response. Please check your connection and try again — your answers are still here.
          </p>
        )}

        <button type="submit" className="btn btn--primary rsvp-form__submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            'Send RSVP'
          )}
        </button>
      </form>
    )
  }

  return (
    <section id="rsvp" className="section section--rsvp" aria-labelledby="rsvp-title">
      <SectionHeading
        id="rsvp-title"
        eyebrow="Kindly reply"
        title="RSVP"
        intro={
          rsvp.deadline
            ? `We would be grateful for your reply by ${formatLongDate(`${rsvp.deadline}T12:00:00Z`)}.`
            : 'We would be grateful to know if you can join us.'
        }
      />
      {content}
    </section>
  )
}
