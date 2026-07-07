"use client";

import Image from "next/image";
import { useState } from "react";
import { apply } from "@/lib/content";
import { useRequestAccess } from "./use-request-access";

/*
  Access-gate page #2 — the "Enter Info" flow for outreach doctors.

  Styling is a near-verbatim port of docs/lili-md-access-gate-page2.html.
  Palette + spacing are unique to this page (rose/mauve on plum, not the
  landing-page gold/wine) so styles are scoped locally via the .apply-page
  root class and won't leak into the rest of the site.

  All user-facing copy lives in @/lib/content.ts (apply.*) per the repo
  convention. Consent uses a native <label>+<input type="checkbox">
  pair for accessibility + correct keyboard behavior (Space toggles,
  Enter submits the form).
*/

export default function ApplyPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [ehr, setEhr] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [consent, setConsent] = useState(false);

  const { submit, pending, error, done } = useRequestAccess();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit({
      firstName,
      lastName,
      practiceName,
      website,
      phone,
      email,
      licenseNo,
      ehr,
      referredBy,
      consent,
    });
  }

  return (
    <main className="apply-page">
      <style jsx>{`
        .apply-page {
          --plum: #1c0916;
          --rose: #d7a98d;
          --rose-bright: #eac6b1;
          --rose-soft: #c9a68f;
          --mauve: #a892a0;
          --line: rgba(215, 169, 141, 0.26);
          --line-strong: rgba(215, 169, 141, 0.45);
          --field-bg: rgba(255, 255, 255, 0.022);
          font-family: var(--font-montserrat), -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--mauve);
          background: var(--plum);
          min-height: 100vh;
          display: flex;
          -webkit-font-smoothing: antialiased;
        }
        .apply-page .visual {
          flex: 0 0 42%;
          position: relative;
          overflow: hidden;
        }
        .apply-page .panel {
          flex: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 52px 56px 34px;
          background: radial-gradient(130% 100% at 62% 40%, #26101d 0%, var(--plum) 70%);
        }
        .apply-page .center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 0;
        }
        .apply-page .card {
          width: 100%;
          max-width: 560px;
        }
        .apply-page .mark {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .apply-page h1 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-weight: 600;
          font-size: 66px;
          letter-spacing: 0.005em;
          color: var(--rose);
          text-align: center;
          line-height: 1;
          margin-bottom: 20px;
        }
        .apply-page .intro {
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.16em;
          line-height: 1.9;
          text-transform: uppercase;
          color: var(--mauve);
          max-width: 460px;
          margin: 0 auto 32px;
        }
        .apply-page .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .apply-page .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .apply-page input,
        .apply-page select {
          width: 100%;
          background: var(--field-bg);
          border: 1px solid var(--line);
          border-radius: 11px;
          padding: 18px 22px;
          color: #f4eaee;
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.12em;
          transition:
            border-color 0.18s,
            background 0.18s,
            box-shadow 0.18s;
          appearance: none;
        }
        .apply-page input::placeholder {
          color: var(--rose-soft);
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-weight: 500;
          opacity: 0.95;
        }
        .apply-page input:focus,
        .apply-page select:focus,
        .apply-page .consent-label:focus-within {
          outline: none;
          border-color: var(--rose);
          background: rgba(255, 255, 255, 0.045);
          box-shadow: 0 0 0 3px rgba(215, 169, 141, 0.1);
        }
        .apply-page select {
          cursor: pointer;
          color: var(--rose-soft);
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }
        .apply-page select.filled {
          color: #f4eaee;
        }
        .apply-page select option {
          background: #241019;
          color: #f4eaee;
          text-transform: none;
          letter-spacing: normal;
        }
        .apply-page .select-wrap {
          position: relative;
        }
        .apply-page .select-wrap::after {
          content: "";
          position: absolute;
          right: 22px;
          top: 50%;
          width: 8px;
          height: 8px;
          border-right: 1.5px solid var(--rose-soft);
          border-bottom: 1.5px solid var(--rose-soft);
          transform: translateY(-70%) rotate(45deg);
          pointer-events: none;
        }
        /* Consent: native <label> containing a native checkbox + text.
           Space toggles the checkbox (browser default); Enter submits the
           form (browser default). No custom key handlers needed. */
        .apply-page .consent-label {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin: 8px 2px 4px;
          padding: 4px 2px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 400;
          line-height: 1.6;
          color: var(--mauve);
          letter-spacing: 0.03em;
          cursor: pointer;
        }
        .apply-page .consent-label input {
          flex: 0 0 20px;
          width: 20px;
          height: 20px;
          margin: 1px 0 0;
          padding: 0;
          appearance: none;
          background: transparent;
          border: 1px solid var(--line-strong);
          border-radius: 6px;
          cursor: pointer;
          display: grid;
          place-content: center;
          box-shadow: none;
        }
        .apply-page .consent-label input:checked {
          background: var(--rose);
          border-color: var(--rose);
        }
        .apply-page .consent-label input:checked::after {
          content: "";
          width: 10px;
          height: 6px;
          border-left: 2px solid #2b1420;
          border-bottom: 2px solid #2b1420;
          transform: rotate(-45deg) translate(1px, -1px);
        }
        .apply-page .consent-label input:focus-visible {
          outline: 2px solid var(--rose);
          outline-offset: 2px;
        }
        .apply-page button.submit {
          width: 100%;
          margin-top: 10px;
          background: linear-gradient(120deg, #eac6b1 0%, #d9a889 55%, #e7bfa6 100%);
          color: #2b1420;
          border: none;
          border-radius: 11px;
          padding: 21px;
          font-family: inherit;
          font-size: 13px;
          letter-spacing: 0.26em;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            filter 0.18s,
            transform 0.05s;
        }
        .apply-page button.submit:hover {
          filter: brightness(1.05);
        }
        .apply-page button.submit:active {
          transform: translateY(1px);
        }
        .apply-page button.submit:disabled {
          filter: brightness(0.65);
          cursor: not-allowed;
        }
        .apply-page .fineprint {
          text-align: center;
          font-size: 10.5px;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: var(--rose-soft);
          opacity: 0.7;
          margin-top: 14px;
        }
        .apply-page .err {
          text-align: center;
          font-size: 12px;
          color: #f0a4a4;
          margin-top: 10px;
          letter-spacing: 0.04em;
        }
        .apply-page .panelfoot {
          flex: 0 0 auto;
        }
        .apply-page .panelfoot .divider {
          height: 1px;
          background: var(--line);
        }
        .apply-page .panelfoot .foot {
          margin-top: 22px;
          font-size: 11.5px;
          letter-spacing: 0.26em;
          font-weight: 500;
          color: var(--rose-soft);
          text-transform: uppercase;
          text-align: center;
        }
        .apply-page .success {
          text-align: center;
          padding: 24px 0;
        }
        .apply-page .success h2 {
          font-family: var(--font-cormorant), Georgia, serif;
          font-weight: 600;
          font-size: 40px;
          color: var(--rose);
          margin-bottom: 14px;
        }
        .apply-page .success p {
          font-size: 13px;
          font-weight: 400;
          line-height: 1.7;
          color: var(--mauve);
          max-width: 400px;
          margin: 0 auto;
          letter-spacing: 0.02em;
        }
        @media (max-width: 900px) {
          .apply-page {
            flex-direction: column;
          }
          .apply-page .visual {
            flex: none;
            width: 100%;
            height: 300px;
          }
          .apply-page .panel {
            min-height: auto;
            padding: 44px 24px 30px;
          }
          .apply-page .row {
            grid-template-columns: 1fr;
          }
          .apply-page h1 {
            font-size: 50px;
          }
        }
      `}</style>

      <div className="visual">
        <Image
          src="/gateway-image-2.png"
          alt="A private office overlooking the marina at dusk"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 42vw"
          className="object-cover object-center"
        />
      </div>

      <div className="panel">
        <div className="center">
          <div className="card">
            <div className="mark">
              <Image
                src="/footer-emblem.png"
                alt="LiLi M.D."
                width={1273}
                height={1252}
                priority
                style={{ width: 60, height: "auto" }}
              />
            </div>

            {done ? (
              <div className="success" role="status" aria-live="polite">
                <h2>{apply.success.heading}</h2>
                <p>{apply.success.body}</p>
              </div>
            ) : (
              <>
                <h1>{apply.heading}</h1>
                <p className="intro">{apply.intro}</p>

                <form className="form" onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={apply.fields.firstName}
                      aria-label={apply.fields.firstName}
                      autoComplete="given-name"
                    />
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={apply.fields.lastName}
                      aria-label={apply.fields.lastName}
                      autoComplete="family-name"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    placeholder={apply.fields.practiceName}
                    aria-label={apply.fields.practiceName}
                    autoComplete="organization"
                  />
                  <input
                    type="url"
                    maxLength={500}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder={apply.fields.website}
                    aria-label={apply.fields.website}
                    autoComplete="url"
                  />
                  <div className="row">
                    <input
                      type="tel"
                      required
                      maxLength={200}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={apply.fields.phone}
                      aria-label={apply.fields.phone}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    <input
                      type="email"
                      required
                      maxLength={200}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={apply.fields.email}
                      aria-label={apply.fields.email}
                      autoComplete="email"
                    />
                  </div>
                  <div className="row">
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={licenseNo}
                      onChange={(e) => setLicenseNo(e.target.value)}
                      placeholder={apply.fields.licenseNo}
                      aria-label={apply.fields.licenseNo}
                      autoCapitalize="characters"
                      autoCorrect="off"
                    />
                    <div className="select-wrap">
                      <select
                        required
                        value={ehr}
                        onChange={(e) => setEhr(e.target.value)}
                        aria-label={apply.fields.ehrPlaceholder}
                        className={ehr ? "filled" : ""}
                      >
                        <option value="" disabled>
                          {apply.fields.ehrPlaceholder}
                        </option>
                        {apply.ehrOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="text"
                    maxLength={200}
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    placeholder={apply.fields.referredBy}
                    aria-label={apply.fields.referredBy}
                  />

                  <label className="consent-label">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>{apply.consent}</span>
                  </label>

                  <button
                    type="submit"
                    className="submit"
                    disabled={pending || !consent}
                  >
                    {pending ? apply.ctaPending : apply.cta}
                  </button>
                  <p className="fineprint">{apply.fineprint}</p>
                  {error && (
                    <p className="err" role="alert" aria-live="assertive">
                      {error}
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>

        <div className="panelfoot">
          <div className="divider" />
          <div className="foot">{apply.footer}</div>
        </div>
      </div>
    </main>
  );
}
