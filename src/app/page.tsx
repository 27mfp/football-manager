import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Shuffle,
  ArrowRight,
  Github,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    href: "/matches",
    title: "Manage Matches",
    description: "Schedule and track football matches with detailed statistics",
    icon: Calendar,
  },
  {
    href: "/players",
    title: "Manage Players",
    description: "Keep track of player profiles, stats, and performance",
    icon: Users,
  },
  {
    href: "/team-generator",
    title: "Team Generator",
    description: "Create balanced teams automatically based on player skills",
    icon: Shuffle,
  },
  {
    href: "/leaderboard",
    title: "Leaderboard",
    description: "View rankings, achievements, and player statistics",
    icon: Trophy,
  },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
            BolaApp
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Manage football games, with elo ranking, player stats, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full max-w-4xl">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="border border-zinc-200 dark:border-zinc-800 transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 h-full">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                      <feature.icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-zinc-800 dark:text-zinc-200">
                          {feature.title}
                        </span>
                        <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </CardTitle>
                      <CardDescription className="text-zinc-600 dark:text-zinc-400">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-10">
            <a
              href="https://github.com/27mfp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-sm"
            >
              <Github className="h-4 w-4" />
              <span>Miguel</span>
              <span className="text-zinc-300 dark:text-zinc-600 mx-2">•</span>
              <span>{new Date().getFullYear()}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
