export interface ProspectStatus {
  id: string
  name: string
  color: string
  icon: string
  description: string
  order: number
}

const prospectStatuses: ProspectStatus[] = [
  {
    id: 'new',
    name: 'New',
    color: '#3b82f6', // Blue
    icon: 'fas fa-star',
    description: 'Newly added prospects that need initial review',
    order: 1
  },
  {
    id: 'contacted',
    name: 'Contacted',
    color: '#8b5cf6', // Purple
    icon: 'fas fa-paper-plane',
    description: 'Prospects that have been contacted but haven\'t responded yet',
    order: 2
  },
  {
    id: 'interested',
    name: 'Interested',
    color: '#10b981', // Green
    icon: 'fas fa-thumbs-up',
    description: 'Prospects that have shown interest in our services',
    order: 3
  },
  {
    id: 'site_generated',
    name: 'Site Generated',
    color: '#f59e0b', // Amber
    icon: 'fas fa-desktop',
    description: 'Prospects with generated websites awaiting approval',
    order: 4
  },
  {
    id: 'negotiating',
    name: 'Negotiating',
    color: '#ec4899', // Pink
    icon: 'fas fa-comments-dollar',
    description: 'Prospects in active negotiation or discussion',
    order: 5
  },
  {
    id: 'ready_to_close',
    name: 'Ready to Close',
    color: '#6366f1', // Indigo
    icon: 'fas fa-check-circle',
    description: 'Prospects ready to be converted to clients',
    order: 6
  },
  {
    id: 'not_interested',
    name: 'Not Interested',
    color: '#ef4444', // Red
    icon: 'fas fa-times-circle',
    description: 'Prospects that have declined our services',
    order: 7
  },
  {
    id: 'on_hold',
    name: 'On Hold',
    color: '#9ca3af', // Gray
    icon: 'fas fa-pause-circle',
    description: 'Prospects temporarily on hold',
    order: 8
  }
]

export default prospectStatuses
