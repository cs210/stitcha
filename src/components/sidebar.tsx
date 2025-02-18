import { BookOpen, Settings, FileText, Users, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-16 bg-gray-100 flex flex-col items-center py-4 border-r">
      <Link href="/" className="mb-8">
        <h1 className="font-bold text-xl">S</h1>
      </Link>
      <nav className="flex flex-col gap-4">
        <Link href="/" className={cn("p-3 rounded-lg hover:bg-gray-200", pathname === "/" && "bg-primary text-white")}>
          <LayoutGrid className="w-5 h-5" />
        </Link>
        <Link
          href="/documents"
          className={cn("p-3 rounded-lg hover:bg-gray-200", pathname === "/documents" && "bg-primary text-white")}
        >
          <FileText className="w-5 h-5" />
        </Link>
        <Link
          href="/seamstresses"
          className={cn("p-3 rounded-lg hover:bg-gray-200", pathname === "/seamstresses" && "bg-primary text-white")}
        >
          <Users className="w-5 h-5" />
        </Link>
        <Link
          href="/docs"
          className={cn("p-3 rounded-lg hover:bg-gray-200", pathname === "/docs" && "bg-primary text-white")}
        >
          <BookOpen className="w-5 h-5" />
        </Link>
        <Link
          href="/settings"
          className={cn(
            "p-3 rounded-lg hover:bg-gray-200",
            pathname === "/settings" && "bg-primary text-white mt-auto",
          )}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </nav>
    </div>
  )
}

