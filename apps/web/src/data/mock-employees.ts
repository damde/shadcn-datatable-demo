export type EmployeeStatus = "Active" | "On Leave" | "Remote" | "Probation"

export type Department =
  | "Engineering"
  | "Product"
  | "Design"
  | "Sales"
  | "Marketing"
  | "Operations"
  | "Finance"

export interface Employee {
  id: string
  name: string
  email: string
  department: Department
  role: string
  status: EmployeeStatus
  salary: number
  joinDate: string
  verified: boolean
  country: string
  performance: number
  projects: number
}

export const DEPARTMENTS: Department[] = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Operations",
  "Finance",
]

export const EMPLOYEE_STATUSES: EmployeeStatus[] = [
  "Active",
  "Remote",
  "On Leave",
  "Probation",
]

export const COUNTRIES = [
  "United States",
  "Germany",
  "United Kingdom",
  "Canada",
  "Japan",
  "France",
  "Australia",
  "Netherlands",
] as const

const FIRST_NAMES = [
  "Elena",
  "Marcus",
  "Sofia",
  "Liam",
  "Aisha",
  "Noah",
  "Mei",
  "Lucas",
  "Priya",
  "Jonas",
  "Camille",
  "Mateo",
  "Hannah",
  "Kenji",
  "Zoe",
  "Daniel",
  "Nadia",
  "Oliver",
  "Chloe",
  "Victor",
]

const LAST_NAMES = [
  "Vance",
  "Thorne",
  "Lindqvist",
  "Kowalski",
  "Patel",
  "Nakamura",
  "Dubois",
  "Moreau",
  "Alvarez",
  "Jensen",
  "Okafor",
  "Berger",
  "Rossi",
  "Chen",
  "Mercer",
  "Sato",
  "Hoffmann",
  "Silva",
  "Novak",
  "Bennett",
]

const ROLES_BY_DEPARTMENT: Record<Department, string[]> = {
  Engineering: [
    "Staff Engineer",
    "Senior Frontend Engineer",
    "Backend Engineer",
    "Platform Architect",
    "QA Automation Lead",
  ],
  Product: [
    "Principal Product Manager",
    "Product Manager",
    "Technical PM",
    "Product Analyst",
  ],
  Design: [
    "Design Director",
    "Senior Product Designer",
    "UX Researcher",
    "Design Systems Lead",
  ],
  Sales: [
    "Enterprise Account Executive",
    "Sales Director",
    "Solutions Consultant",
    "Account Manager",
  ],
  Marketing: [
    "Growth Lead",
    "Content Strategist",
    "Product Marketing Manager",
    "Brand Designer",
  ],
  Operations: [
    "Operations Manager",
    "People Operations Lead",
    "IT Systems Administrator",
    "Program Coordinator",
  ],
  Finance: [
    "VP of Finance",
    "Senior Financial Analyst",
    "Controller",
    "Payroll Specialist",
  ],
}

/**
 * Deterministic LCG pseudo-random generator for reproducible mock datasets.
 */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

/**
 * Generates a deterministic array of mock employees for showcase tables.
 */
export function generateEmployees(count: number): Employee[] {
  const rand = createSeededRandom(20261124)
  const employees: Employee[] = new Array(count)

  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[(i + Math.floor(rand() * FIRST_NAMES.length)) % FIRST_NAMES.length]!
    const last = LAST_NAMES[(Math.floor(i / FIRST_NAMES.length) + Math.floor(rand() * LAST_NAMES.length)) % LAST_NAMES.length]!
    const name = `${first} ${last}`

    const department = DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)]!
    const roles = ROLES_BY_DEPARTMENT[department]
    const role = roles[Math.floor(rand() * roles.length)]!
    const status = EMPLOYEE_STATUSES[Math.floor(rand() * EMPLOYEE_STATUSES.length)]!
    const country = COUNTRIES[Math.floor(rand() * COUNTRIES.length)]!

    const baseSalary =
      department === "Engineering" || department === "Product"
        ? 95000
        : department === "Finance" || department === "Design"
          ? 85000
          : 72000
    const salary = baseSalary + Math.floor(rand() * 85) * 1000

    const year = 2018 + Math.floor(rand() * 8)
    const month = String(1 + Math.floor(rand() * 12)).padStart(2, "0")
    const day = String(1 + Math.floor(rand() * 28)).padStart(2, "0")
    const joinDate = `${year}-${month}-${day}`

    const verified = rand() > 0.22
    const performance = Math.round((2.8 + rand() * 2.2) * 10) / 10
    const projects = 1 + Math.floor(rand() * 12)

    const emailHandle = `${first.toLowerCase()}.${last.toLowerCase()}.${i + 1}`
    const email = `${emailHandle}@acme-corp.io`

    employees[i] = {
      id: `EMP-${String(i + 1).padStart(5, "0")}`,
      name,
      email,
      department,
      role,
      status,
      salary,
      joinDate,
      verified,
      country,
      performance,
      projects,
    }
  }

  return employees
}
