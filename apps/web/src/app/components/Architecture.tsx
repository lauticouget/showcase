'use client';

import { useRef, useState } from 'react';

type LayerKey = 'browser' | 'gateway' | 'lambda' | 'infra';

interface LayerDetail {
  title: string;
  color: string;
  tech: string[];
  description: string;
}

const layers: Record<LayerKey, LayerDetail> = {
  browser: {
    title: 'Browser',
    color: 'from-accent-primary to-accent-primary/60',
    tech: ['Next.js 16', 'React 19', 'Tailwind CSS'],
    description:
      'Hybrid Server-rendered React app with client components for interactivity, hosted on AWS Amplify. Uses the App Router with server components for fast initial.',
  },
  gateway: {
    title: 'API Gateway',
    color: 'from-accent-secondary to-accent-secondary/60',
    tech: ['AWS HTTP API', 'CORS', 'Routes'],
    description:
      'AWS HTTP API handles routing and CORS preflight responses, all at the infrastructure level.',
  },
  lambda: {
    title: 'Lambda',
    color: 'from-accent-tertiary to-accent-tertiary/60',
    tech: ['Apollo Server 5', 'GraphQL', 'Node.js 24'],
    description:
      'Serverless GraphQL API running on ARM64. Bundled with esbuild into a single file. 256MB memory, 15s timeout.',
  },
  infra: {
    title: 'Infrastructure',
    color: 'from-accent-primary via-accent-secondary to-accent-tertiary',
    tech: ['SAM / CloudFormation', 'GitHub Actions', 'Nx Monorepo', 'Amplify'],
    description:
      'Infrastructure as Code with AWS SAM. CI runs lint, typecheck, and tests on affected projects. CD deploys automatically: API via SAM, frontend via Amplify.',
  },
};

function AnimatedArrow({ direction }: { direction: 'right' | 'down' }) {
  const isRight = direction === 'right';

  return (
    <div
      className={`relative flex items-center justify-center ${
        isRight ? 'h-1 w-12 md:w-16' : 'h-12 w-1 md:h-16'
      }`}
    >
      {/* Track */}
      <div
        className={`absolute rounded-full bg-border ${
          isRight ? 'h-px w-full' : 'h-full w-px'
        }`}
      />
      {/* Animated dot */}
      <div
        className={`absolute ${
          isRight ? 'h-2 w-full' : 'h-full w-2'
        }`}
      >
        <div
          className={`absolute h-2 w-2 rounded-full bg-accent-primary ${
            isRight ? 'animate-flow-right' : 'animate-flow-down'
          }`}
        />
      </div>
    </div>
  );
}

function NodeCard({
  layerKey,
  isActive,
  onClick,
}: {
  layerKey: LayerKey;
  isActive: boolean;
  onClick: () => void;
}) {
  const layer = layers[layerKey];

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 md:p-6 ${
        isActive
          ? 'border-accent-primary/50 bg-bg-tertiary shadow-lg shadow-accent-primary/5'
          : 'border-border bg-bg-secondary hover:border-border-accent'
      }`}
    >
      {/* Glow dot */}
      <div
        className={`h-3 w-3 rounded-full bg-gradient-to-r ${layer.color} ${
          isActive ? 'animate-pulse-glow' : 'opacity-40'
        }`}
      />

      {/* Title */}
      <span className="text-sm font-semibold text-text-primary md:text-base">
        {layer.title}
      </span>

      {/* Tech pills */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {layer.tech.map((t) => (
          <span
            key={t}
            className="rounded-full bg-bg-primary px-2 py-0.5 text-[10px] text-text-secondary md:text-xs"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
      )}
    </button>
  );
}

export default function Architecture() {
  const [active, setActive] = useState<LayerKey>('browser');
  const detailRef = useRef<HTMLDivElement>(null);
  const detail = layers[active];

  const selectLayer = (key: LayerKey) => {
    setActive(key);
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <section className="border-t border-border bg-bg-primary">
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-10 md:px-12 md:pt-28 md:pb-12">
        {/* Section header */}
        <div className="text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-accent-secondary">
            Live Architecture
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Request Path
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-text-secondary">
            Every request you make on this site flows through this stack. Click
            any layer to explore what powers it.
          </p>
        </div>

        {/* Request flow — horizontal on desktop, vertical on mobile */}
        <div className="mt-14 flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-3">
          <NodeCard
            layerKey="browser"
            isActive={active === 'browser'}
            onClick={() => selectLayer('browser')}
          />
          {/* Down arrow on mobile, right arrow on desktop */}
          <div className="md:hidden">
            <AnimatedArrow direction="down" />
          </div>
          <div className="hidden md:block">
            <AnimatedArrow direction="right" />
          </div>
          <NodeCard
            layerKey="gateway"
            isActive={active === 'gateway'}
            onClick={() => selectLayer('gateway')}
          />
          <div className="md:hidden">
            <AnimatedArrow direction="down" />
          </div>
          <div className="hidden md:block">
            <AnimatedArrow direction="right" />
          </div>
          <NodeCard
            layerKey="lambda"
            isActive={active === 'lambda'}
            onClick={() => selectLayer('lambda')}
          />
        </div>

        {/* Detail panel */}
        <div ref={detailRef} className="mx-auto mt-10 max-w-2xl rounded-xl border border-border bg-bg-secondary p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${detail.color} animate-pulse-glow`}
            />
            <h3 className="text-lg font-semibold text-text-primary">
              {detail.title}
            </h3>
          </div>
          <p className="mt-3 leading-relaxed text-text-secondary">
            {detail.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {detail.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-code-bg px-3 py-1 font-mono text-xs text-code-text"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Infrastructure bar */}
        <button
          onClick={() => selectLayer('infra')}
          className={`mx-auto mt-8 flex w-full max-w-2xl flex-col items-center gap-3 rounded-xl border p-4 transition-all duration-300 md:flex-row md:justify-center ${
            active === 'infra'
              ? 'border-accent-primary/50 bg-bg-tertiary'
              : 'border-border bg-bg-secondary hover:border-border-accent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r ${layers.infra.color} ${
                active === 'infra' ? 'animate-pulse-glow' : 'opacity-40'
              }`}
            />
            <span className="text-sm font-semibold text-text-primary">
              Infrastructure &amp; CI/CD
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {layers.infra.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-bg-primary px-2 py-0.5 text-[10px] text-text-secondary md:text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        </button>
      </div>
    </section>
  );
}
