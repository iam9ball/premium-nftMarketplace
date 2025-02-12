import type React from "react"
import { LogOut } from "lucide-react"

interface LeaveButtonProps {
  onClick: () => void
}

const LeaveButton: React.FC<LeaveButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 right-4 z-10 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-md transition-colors duration-200 lg:top-6 lg:right-6"
      aria-label="Leave auction"
    >
      <LogOut size={24} />
    </button>
  )
}

export default LeaveButton

