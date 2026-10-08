import { motion, useReducedMotion } from "framer-motion"
import { intelligenceChapters, landingImages } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { CinematicImage } from "./CinematicImage"

export function AgricultureSection() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section id="intelligence" className="bg-canvas">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("intel.kicker")}</p>
        <h2 className="font-display mt-4 max-w-3xl text-[clamp(1.85rem,4.5vw,3.75rem)] leading-snug text-ink">
          {t("intel.title")}
        </h2>
      </div>

      {intelligenceChapters.map((chapter, index) => {
        const image = landingImages.intelligence[index]
        const full = index === 2
        const imageLeft = index % 2 === 1

        if (full) {
          return (
            <article key={chapter.id} className="relative min-h-[70svh] overflow-hidden bg-ink">
              <CinematicImage
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 h-full w-full"
                overlay="dark"
                reveal="up"
                clipReveal
              />
              <div className="relative mx-auto flex min-h-[70svh] max-w-6xl items-end px-5 py-16 sm:px-8">
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  className="max-w-xl text-white"
                >
                  <p className={`text-[11px] text-white/55 ${kickerClass}`}>
                    {t(`intel.${chapter.id}Meta`)}
                  </p>
                  <h3 className="font-display mt-3 text-[clamp(1.7rem,3.5vw,3rem)] leading-snug">
                    {t(`intel.${chapter.id}Title`)}
                  </h3>
                  <p className="mt-4 leading-relaxed text-white/75">
                    {t(`intel.${chapter.id}Body`)}
                  </p>
                </motion.div>
              </div>
            </article>
          )
        }

        return (
          <article key={chapter.id} className="border-b border-line">
            <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
              <div
                className={`flex min-w-0 flex-col justify-center px-5 py-16 sm:px-8 ${
                  imageLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"
                }`}
              >
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`text-[11px] text-leaf ${kickerClass}`}
                >
                  {t(`intel.${chapter.id}Kicker`)}
                </motion.p>
                <motion.h3
                  initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  className="font-display mt-3 text-[clamp(1.7rem,3.5vw,3rem)] leading-snug text-ink"
                >
                  {t(`intel.${chapter.id}Title`)}
                </motion.h3>
                <p className={`mt-2 text-[11px] leading-snug text-ink-muted ${kickerClass}`}>
                  {t(`intel.${chapter.id}Meta`)}
                </p>
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-5 max-w-md leading-relaxed text-ink-muted"
                >
                  {t(`intel.${chapter.id}Body`)}
                </motion.p>
              </div>
              <div
                className={`relative min-h-[58vw] overflow-hidden lg:min-h-[32rem] ${
                  imageLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"
                }`}
              >
                <CinematicImage
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full"
                  clipReveal
                  reveal={imageLeft ? "left" : "right"}
                />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
