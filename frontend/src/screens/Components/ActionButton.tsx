import React from 'react'

interface ActionButtonProps {
  icon: string
  label: string
  gradientFrom: string
  gradientTo: string
  onClick: () => void
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  gradientFrom,
  gradientTo,
  onClick,
}) => {
  return (
    <button
      className={`flex flex-col items-center justify-center p-6 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
      onClick={onClick}
    >
      <span className="text-4xl mb-2">{icon}</span>
      <span className="text-lg font-semibold">{label}</span>
    </button>
  )
}

export default ActionButton
