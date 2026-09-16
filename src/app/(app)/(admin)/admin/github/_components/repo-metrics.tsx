import { AlertCircle, Clock, GitCommit, GitMerge, GitPullRequest } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site-config";
import { octokit } from "@/server/services/github/github-service";

interface RepoMetric {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}

interface RepoMetricsProps {
  className?: string;
}

export function RepoMetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => `metric-skeleton-${i}`).map((id) => (
        <Card key={id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Fetching lives here, on its own, so no JSX is ever constructed inside a
 * try/catch. React renders lazily, so an error thrown while an element renders
 * escapes the try block it was written in; an error boundary is the only thing
 * that catches it.
 */
type RepoMetricsResult =
  | { status: "unavailable" }
  | { status: "ok"; metrics: RepoMetric[] }
  | { status: "error"; badCredentials: boolean };

async function loadRepoMetrics(): Promise<RepoMetricsResult> {
  if (!octokit) {
    return { status: "unavailable" };
  }

  const repoOwner = siteConfig.repo.owner;
  const repoName = siteConfig.repo.name;

  try {
    const [{ data: pullRequests }, { data: commits }, { data: branches }] = await Promise.all([
      octokit.rest.pulls.list({ owner: repoOwner, repo: repoName, state: "all", per_page: 1 }),
      octokit.rest.repos.listCommits({ owner: repoOwner, repo: repoName, per_page: 30 }),
      octokit.rest.repos.listBranches({ owner: repoOwner, repo: repoName, per_page: 100 }),
    ]);

    const lastCommitDate = commits[0]?.commit?.author?.date
      ? new Date(commits[0].commit.author.date)
      : new Date();
    const daysSinceLastCommit = Math.floor(
      (new Date().getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      status: "ok",
      metrics: [
        {
          id: "pull-requests",
          title: "Pull Requests",
          value: pullRequests[0]?.number || 0,
          icon: <GitPullRequest className="h-4 w-4 text-blue-500" />,
          description: "Total pull requests",
        },
        {
          id: "recent-commits",
          title: "Recent Commits",
          value: commits.length,
          icon: <GitCommit className="h-4 w-4 text-green-500" />,
          description: "Last 30 commits",
        },
        {
          id: "branches",
          title: "Branches",
          value: branches.length,
          icon: <GitMerge className="h-4 w-4 text-purple-500" />,
          description: "Active branches",
        },
        {
          id: "last-activity",
          title: "Last Activity",
          value: daysSinceLastCommit === 0 ? "Today" : `${daysSinceLastCommit} days ago`,
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          description: "Since last commit",
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching repo metrics:", error);
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    return {
      status: "error",
      badCredentials:
        message.toLowerCase().includes("bad credentials") || message.includes("401"),
    };
  }
}

export async function RepoMetricsContent() {
  const result = await loadRepoMetrics();

  if (result.status === "unavailable") {
    return (
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              GitHub API Unavailable
            </CardTitle>
            <CardDescription>
              GitHub API client is not configured. Repository metrics cannot be displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">To enable GitHub repository metrics:</p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>
                Set <code>NEXT_PUBLIC_FEATURE_GITHUB_API_ENABLED=true</code>
              </li>
              <li>
                Configure <code>GITHUB_ACCESS_TOKEN</code> in your environment
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {result.badCredentials
                ? "GitHub API: Bad Credentials"
                : "Error Loading Repository Metrics"}
            </CardTitle>
            <CardDescription>
              {result.badCredentials
                ? "The GitHub access token is invalid or missing required permissions."
                : "Failed to fetch repository information from GitHub"}
            </CardDescription>
          </CardHeader>
          {result.badCredentials && (
            <CardContent>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  Ensure <code>GITHUB_ACCESS_TOKEN</code> is set in your environment
                </li>
                <li>
                  The token must have the <code>repo</code> scope
                </li>
              </ul>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {result.metrics.map((metric) => (
        <Card key={metric.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RepoMetrics({ className }: RepoMetricsProps) {
  return (
    <div className={className}>
      <Suspense fallback={<RepoMetricsSkeleton />}>
        <RepoMetricsContent />
      </Suspense>
    </div>
  );
}
