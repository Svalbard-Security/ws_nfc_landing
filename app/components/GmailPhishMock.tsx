import { inter } from "@/app/fonts";

function GmailMIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden
    >
      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <path fill="#5f6368" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#5f6368"
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>
  );
}

/** One MVP scenario: looks like a real Gmail mobile thread row + opened snippet. */
export function GmailPhishMock() {
  return (
    <div
      className={`${inter.className} flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#dadce0] bg-[#f6f8fc] shadow-[0_12px_40px_rgba(0,0,0,0.35)]`}
    >
      {/* App bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-[#e8eaed] bg-white px-2 py-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-[#f1f3f4] active:bg-[#e8eaed]"
          aria-hidden
        >
          <MenuIcon />
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <GmailMIcon className="shrink-0" />
          <span className="truncate text-[17px] font-normal tracking-tight text-[#5f6368]">
            Gmail
          </span>
        </div>
        <div
          className="size-8 shrink-0 rounded-full bg-gradient-to-br from-[#7baaf7] to-[#1967d2] ring-2 ring-white"
          aria-hidden
        />
      </header>

      {/* Search pill */}
      <div className="shrink-0 bg-white px-3 pb-2 pt-1">
        <div className="flex items-center gap-3 rounded-full bg-[#eaf1fb] px-4 py-2.5">
          <SearchIcon />
          <span className="text-[15px] text-[#5f6368]">Search in mail</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-[#e8eaed] bg-white px-1">
        {(["Primary", "Promotions", "Social"] as const).map((t, i) => (
          <div
            key={t}
            className={`relative flex-1 py-3 text-center text-[13px] ${
              i === 0
                ? "font-semibold text-[#d93025]"
                : "font-medium text-[#5f6368]"
            }`}
          >
            {t}
            {i === 0 && (
              <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t bg-[#d93025]" />
            )}
          </div>
        ))}
      </div>

      {/* Inbox list area */}
      <div className="min-h-0 flex-1 overflow-hidden bg-[#f6f8fc]">
        {/* Unread row — Gmail mobile density */}
        <article className="border-b border-[#e8eaed] bg-white">
          <div className="flex min-h-0">
            <div className="w-1 shrink-0 bg-[#1a73e8]" aria-hidden />
            <div className="flex min-w-0 flex-1 gap-3 px-3 py-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#dadce0] bg-white shadow-sm"
                aria-hidden
              >
                <GmailMIcon className="size-[22px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[15px] font-bold text-[#202124]">
                    Google
                  </span>
                  <time className="shrink-0 text-[12px] text-[#5f6368]">
                    9:41 AM
                  </time>
                </div>
                <h2 className="mt-0.5 truncate text-[14px] font-bold leading-tight text-[#202124]">
                  New sign-in to your Google Account
                </h2>
                <p className="mt-0.5 line-clamp-2 text-[14px] leading-snug text-[#5f6368]">
                  Security alert — Unusual sign-in from Chrome on Windows. If
                  this was you, no action is needed. If not, verify your account
                  now to prevent loss of access…
                </p>
              </div>
            </div>
          </div>

          {/* Opened message body (what you see after tap) */}
          <div className="border-t border-[#f1f3f4] bg-white px-4 pb-4 pt-3">
            <p className="text-[12px] leading-relaxed text-[#5f6368]">
              <span className="font-medium text-[#202124]">Google</span>
              <span className="text-[#5f6368]"> · </span>
              <span className="break-all text-[#1a73e8]">
                noreply@g00gle-account-verification.net
              </span>
            </p>
            <p className="mt-1 text-[12px] text-[#5f6368]">to me</p>

            <div className="mt-3 space-y-2 text-[13px] leading-snug text-[#202124]">
              <p>
                We noticed a new sign-in from a device we don&apos;t recognize.
                Confirm within <span className="font-medium">24 hours</span>{" "}
                or access may be limited.
              </p>
              <p className="text-[#5f6368]">
                If this wasn&apos;t you, someone else may have your password.
              </p>
            </div>

            <div className="mt-3 rounded-lg border border-[#dadce0] bg-[#f8f9fa] px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368]">
                Device
              </p>
              <p className="text-[13px] text-[#202124]">
                Chrome · Windows · Warsaw, PL
              </p>
            </div>

            <button
              type="button"
              className="mt-4 inline-flex rounded bg-[#1a73e8] px-5 py-2.5 text-[14px] font-medium text-white shadow-sm"
            >
              Verify it&apos;s you
            </button>

            <p className="mt-3 break-all text-[11px] leading-snug text-[#5f6368]">
              Or paste:{" "}
              <span className="text-[#1a73e8] underline">
                https://accounts.g00gle-secure-verify.net/SignInRecovery
              </span>
            </p>

            <p className="mt-3 border-t border-[#f1f3f4] pt-2 text-[10px] leading-snug text-[#5f6368]">
              You received this message about important changes to your Google
              Account.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
