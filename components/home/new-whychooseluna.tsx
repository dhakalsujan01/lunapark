"use client"; // Required for animations

import Image from "next/image";
import { motion } from "framer-motion";
import { Mountain, FerrisWheel, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
};

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || "en";

  return (
    <main>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-800">
        <div className="grid lg:grid-cols-2">
          {/* Left Column - Image with Ken Burns Effect */}
          <div className="relative h-[50vh] overflow-hidden lg:h-screen lg:[clip-path:polygon(0_0,_100%_0,_85%_100%,_0%_100%)]">
            <motion.div
              className="h-full w-full"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <Image
                src="/amusement-park-aerial-view.png"
                alt={t("home.whyChoose.image.alt")}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Right Column - Animated Content */}
          <motion.div
            className="flex flex-col p-8 md:p-12 lg:p-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 1. Header with Logo */}
            <motion.header variants={itemVariants}>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {t("home.whyChoose.logo")}
              </h1>
            </motion.header>

            {/* 2. Main Content */}
            <div className="my-auto py-12">
              <motion.h2
                variants={itemVariants}
                className="text-4xl font-black tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl"
              >
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                  {t("home.whyChoose.title.highlight")}
                </span>
                {t("home.whyChoose.title.main")}
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
              >
                {t("home.whyChoose.subtitle")}
              </motion.p>
              
              {/* Feature List */}
              <motion.ul
                variants={itemVariants}
                className="mt-10 space-y-5"
              >
                <FeatureItem icon={Mountain} text={t("home.whyChoose.features.rides")} />
                <FeatureItem icon={FerrisWheel} text={t("home.whyChoose.features.views")} />
                <FeatureItem icon={Sparkles} text={t("home.whyChoose.features.shows")} />
              </motion.ul>
            </div>

            {/* 3. Footer with CTA and Social Proof */}
            <motion.footer variants={itemVariants} className="mt-auto">
              <div className="flex flex-col items-start gap-y-8 sm:flex-row sm:items-center sm:justify-between">
                <Link 
                  href={`/${currentLocale}/attractions`}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-8 py-3.5 font-bold text-white transition-all duration-300 hover:bg-blue-700"
                >
                  <span className="absolute bottom-0 left-0 mb-9 ml-9 h-48 w-48 -translate-x-full translate-y-full rotate-45 transform bg-white opacity-20 transition-all duration-500 ease-out group-hover:translate-x-0"></span>
                  {t("home.whyChoose.cta")}
                </Link>
                <div className="flex items-center -space-x-2">
                  <img className="h-10 w-10 rounded-full border-2 border-white object-cover" src="https://randomuser.me/api/portraits/women/75.jpg" alt={t("home.whyChoose.visitors.visitor1")} />
                  <img className="h-10 w-10 rounded-full border-2 border-white object-cover" src="https://randomuser.me/api/portraits/men/32.jpg" alt={t("home.whyChoose.visitors.visitor2")} />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-semibold text-slate-600">1M+</div>
                  <span className="pl-4 text-sm font-medium text-slate-600">{t("home.whyChoose.visitors.annual")}</span>
                </div>
              </div>
            </motion.footer>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <motion.li
      className="flex items-center gap-3"
      whileHover={{ x: 5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-lg font-medium text-slate-700">{text}</span>
    </motion.li>
  );
}