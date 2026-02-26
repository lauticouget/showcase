import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />

      <div className="relative mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-32 lg:py-40">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {/* Text — full width on mobile, left side on desktop */}
          <div className="order-2 text-center md:order-1 md:flex-1 md:text-left">
            <p className="text-sm font-medium tracking-widest uppercase text-accent-primary">
              Full-Stack Developer
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Lautaro
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary md:text-lg">
              I build modern web applications with TypeScript, React, GraphQL,
              and AWS. This site is a live showcase of the tools and patterns I
              use — from CI/CD pipelines to serverless infrastructure.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <a
                href="https://www.linkedin.com/in/lautarocouget/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A66C2] px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://github.com/lauticouget/showcase"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border-accent px-6 py-3 text-center text-sm font-semibold text-text-primary transition-colors hover:border-accent-primary hover:text-accent-primary"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Profile picture — centered on mobile, right side on desktop */}
          <div className="order-1 md:order-2 md:flex-shrink-0">
            <div className="relative h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent-primary via-accent-secondary to-accent-tertiary opacity-50 blur-md" />
              <Image
                src="/profile_picture.jpg"
                alt="Lautaro Couget"
                fill
                priority
                className="relative rounded-full border-2 border-border object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
