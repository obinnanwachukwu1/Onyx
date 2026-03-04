import { Mail, Github, Linkedin, ArrowUpRight } from 'lucide-react';
import './ContactMe.css';

const ContactMe = (): JSX.Element => {
  return (
    <div className="flex h-full w-full bg-[var(--window-bg)] text-[var(--text-color)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-4 sm:p-6 md:p-10 lg:p-12">
          <header className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="mb-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-color)]">Get in Touch</h1>
            <p className="text-base sm:text-lg text-[var(--text-color)] opacity-70 max-w-xl">
              Reach out through any of the links below.
            </p>
          </header>

          <div className="grid gap-4 sm:gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <a
              href="mailto:business@obinnanwachukwu.com"
              className="group block rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-4 sm:p-5 transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--welcome-accent-blue)]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-emerald-soft)] text-[var(--welcome-accent-emerald)]">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-[var(--text-color)]">Email</h3>
              <p className="text-sm sm:text-base text-[var(--text-color)] opacity-70 break-all">business@obinnanwachukwu.com</p>
            </a>

            <a
              href="https://www.linkedin.com/in/obinnanwachukwugt"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-4 sm:p-5 transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--welcome-accent-blue)]"
            >
              <div className="absolute right-5 top-5 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4 text-[var(--text-color)] opacity-50" />
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-blue-soft)] text-[var(--welcome-accent-blue)]">
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-[var(--text-color)]">LinkedIn</h3>
              <p className="text-sm sm:text-base text-[var(--text-color)] opacity-70">Connect professionally</p>
            </a>

            <a
              href="https://www.github.com/obinnanwachukwu1"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-4 sm:p-5 transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--welcome-accent-blue)]"
            >
              <div className="absolute right-5 top-5 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4 text-[var(--text-color)] opacity-50" />
              </div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--text-color)] text-[var(--window-bg)] opacity-80">
                <Github className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-[var(--text-color)]">GitHub</h3>
              <p className="text-sm sm:text-base text-[var(--text-color)] opacity-70">Check out my code</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMe;
