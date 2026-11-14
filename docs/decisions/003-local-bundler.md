# Decision 003 Use Webpack for the local baseline

The installed Next 16.3.4 Turbopack CSS worker exits before connecting on this Windows host, including outside the sandbox. The documented --webpack mode compiles the same source successfully. dev and build explicitly use Webpack; this is a supported bundler choice. The final Next.js 16.4.6 production build also passed in Webpack mode. Reevaluate Turbopack separately from the completed foundation.
