import { useState } from 'react';
import { Mail, Github, Linkedin, Send, MessageSquare, ArrowUpRight } from 'lucide-react';
import './ContactMe.css';

type FormData = {
  name: string;
  email: string;
  message: string;
};

const ContactMe = (): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Message sent:', formData);
    setFormData({ name: '', email: '', message: '' });
    alert('Your message has been sent!');
  };

  return (
    <div className="flex h-full w-full bg-[var(--window-bg)] text-[var(--text-color)]">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-4 sm:p-6 md:p-10 lg:p-12">
          
          {/* Header */}
          <header className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="mb-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[var(--text-color)]">Get in Touch</h1>
            <p className="text-base sm:text-lg text-[var(--text-color)] opacity-70 max-w-2xl">
              Have a project in mind, a question, or just want to say hi? I'd love to hear from you.
            </p>
          </header>

          <div className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-3">
            
            {/* Contact Methods (Left Column) */}
            <div className="space-y-4 lg:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {/* Email Card */}
              <a 
                href="mailto:me@obinnanwachukwu.com" 
                className="group block rounded-xl border border-[var(--window-border-inactive)] bg-[var(--welcome-card-bg)] p-4 sm:p-5 transition-all hover:border-[var(--window-border-active)] hover:bg-[var(--welcome-card-hover)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--welcome-accent-blue)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--welcome-accent-emerald-soft)] text-[var(--welcome-accent-emerald)]">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-[var(--text-color)]">Email</h3>
                <p className="text-sm sm:text-base text-[var(--text-color)] opacity-70 break-all">me@obinnanwachukwu.com</p>
              </a>

              {/* LinkedIn Card */}
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

              {/* GitHub Card */}
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

            {/* Contact Form (Right Column) */}
            <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="rounded-2xl border border-[var(--window-border-inactive)] bg-[var(--card-bg)] p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--subtle-bg)] text-[var(--text-color)]">
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-color)]">Send a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-[var(--text-color)] opacity-80">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 sm:px-4 text-[var(--text-color)] outline-none transition-all focus:border-[var(--welcome-accent-blue)] focus:ring-2 focus:ring-[var(--welcome-accent-blue-soft)]"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-[var(--text-color)] opacity-80">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 sm:px-4 text-[var(--text-color)] outline-none transition-all focus:border-[var(--welcome-accent-blue)] focus:ring-2 focus:ring-[var(--welcome-accent-blue-soft)]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-[var(--text-color)] opacity-80">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full resize-none rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2.5 sm:px-4 text-[var(--text-color)] outline-none transition-all focus:border-[var(--welcome-accent-blue)] focus:ring-2 focus:ring-[var(--welcome-accent-blue-soft)]"
                      placeholder="How can I help you?"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto justify-center flex items-center gap-2 rounded-lg bg-[var(--welcome-accent-blue)] px-5 sm:px-6 py-2.5 font-medium text-white transition-all hover:bg-blue-600 active:scale-95 shadow-sm hover:shadow"
                    >
                      Send Message
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMe;
