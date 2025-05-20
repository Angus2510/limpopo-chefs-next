import {
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  DollarSign,
  Building,
  ClipboardList,
  FileCheck,
  Bell,
  FileText,
  File,
  FilePlus,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  if (pathname.startsWith("/admin")) {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/admin/dashboard",
            label: "Dashboard",
            active: pathname.includes("/admin/dashboard"),
            icon: LayoutGrid,
            submenus: [],
          },
        ],
      },

      // Student Management
      {
        groupLabel: "Student Management",
        menus: [
          {
            href: "/admin/student/",
            label: "Students",
            active: pathname.includes("/admin/student"),
            icon: Users,
            submenus: [],
          },
          {
            href: "/admin/finance",
            label: "Finance",
            active: pathname.includes("admin/finance"),
            icon: DollarSign,
            submenus: [
              {
                href: "/admin/finance/payable",
                label: "Fees: To Pay",
                active: pathname === "admin/finance/payable",
              },
            ],
          },
          {
            href: "/admin/attendance",
            label: "Attendance",
            active: pathname.includes("/admin/attendance"),
            icon: ClipboardList,
            submenus: [
              {
                href: "/admin/attendance/student",
                label: "Student Attendance ",
                active: pathname === "/admin/attendance/student",
              },
              {
                href: "/admin/attendance/qr",
                label: "QR Attendance",
                active: pathname === "/admin/attendance/qr",
              },
              {
                href: "/admin/attendance/group",
                label: "Group Attendance",
                active: pathname === "/admin/attendance/group",
              },
            ],
          },
        ],
      },

      // Academic Management
      {
        groupLabel: "Academic Management",
        menus: [
          {
            href: "/admin/assignment",
            label: "Tests/Tasks",
            active: pathname.includes("/admin/assignment"),
            icon: FileText,
            submenus: [
              {
                href: "/admin/assignment",
                label: "All Test/Tasks",
                active: pathname === "/admin/assignment",
              },
              {
                href: "/admin/assignment/create",
                label: "Create Test/Task",
                active: pathname === "/admin/assignment/create",
              },
              {
                href: "/admin/assignment/mark",
                label: "Mark Test/Task",
                active: pathname === "/admin/assignment/mark",
              },
            ],
          },
          {
            href: "/admin/results",
            label: "Results",
            active: pathname.includes("/admin/results"),
            icon: FileCheck,
            submenus: [
              {
                href: "/admin/results/capture",
                label: "Capture Results",
                active: pathname === "/admin/results/capture",
              },
              {
                href: "admin/results/sor",
                label: "S.O.R",
                active: pathname === "admin/results/sor",
              },
            ],
          },
          {
            href: "/admin/uploads",
            label: "Learning Material",
            active: pathname.includes("/admin/uploads"),
            icon: FilePlus,
            submenus: [],
          },
        ],
      },

      // WEL
      {
        groupLabel: "General",
        menus: [
          {
            href: "/admin/wel",
            label: "WEL",
            active: pathname.includes("/admin/wel"),
            icon: File,
            submenus: [
              {
                href: "/admin/wel/locations",
                label: "WEL Locations",
                active: pathname === "/admin/wel/locations",
              },
              {
                href: "/admin/wel/students",
                label: "Student WEL Records",
                active: pathname === "/admin/wel/students",
              },
            ],
          },
          {
            href: "/admin/notifications",
            label: "Notifications",
            active: pathname.includes("/admin/notifications"),
            icon: Bell,
            submenus: [],
          },
          {
            href: "/admin/admin",
            label: "Admin",
            active: pathname.includes("/admin/admin"),
            icon: Building,
            submenus: [
              {
                href: "/admin/admin/graduate",
                label: "Graduate Student",
                active: pathname === "/admin/admin/graduate",
              },
              {
                href: "/admin/admin/alumni",
                label: "Alumni",
                active: pathname === "/admin/admin/alumni",
              },
            ],
          },
          {
            href: "/admin/reports",
            label: "Reports",
            active: pathname.includes("/admin/reports"),
            icon: FileText,
            submenus: [
              {
                href: "/admin/reports/arrears",
                label: "Account in Arrears",
                active: pathname === "/admin/reports/arrears",
              },
              {
                href: "/admin/reports/moderation",
                label: "Moderation",
                active: pathname === "/admin/reports/moderation",
              },
            ],
          },
          {
            href: "admin/settings",
            label: "Settings",
            active: pathname.includes("admin/settings"),
            icon: Settings,
            submenus: [
              {
                href: "/admin/settings/campus",
                label: "Campus",
                active: pathname === "/admin/settings/campus",
              },
              {
                href: "/admin/settings/intake-group",
                label: "Intake Group",
                active: pathname === "/settings/intake-group",
              },
              {
                href: "/admin/settings/outcomes",
                label: "Outcome",
                active: pathname === "/settings/outcomes",
              },
              {
                href: "/admin/settings/roles",
                label: "Role",
                active: pathname === "/admin/settings/roles",
              },
              {
                href: "/admin/settings/staff",
                label: "Staff",
                active: pathname === "/admin/settings/staff",
              },
              {
                href: "/admin/settings/accommodations",
                label: "Student Accommodation",
                active: pathname === "/admin/settings/accommodation",
              },
            ],
          },
        ],
      },
    ];
  } else if (pathname.startsWith("/student")) {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/student/dashboard",
            label: "Dashboard",
            active: pathname.includes("/student/dashboard"),
            icon: LayoutGrid,
            submenus: [],
          },
        ],
      },
      {
        groupLabel: "Student Contents",
        menus: [
          {
            href: "/student/assignments",
            label: "Assessments",
            active: pathname.includes("/student/assignments"),
            icon: SquarePen,
            submenus: [],
          },
          {
            href: "/student/attendance",
            label: "Attendance",
            active: pathname.includes("/student/attendance"),
            icon: ClipboardList,
            submenus: [
              {
                href: "/student/attendance/scanAttendance",
                label: "Scan Attendance",
                active: pathname === "/student/attendance/scanAttendance",
              },
              {
                href: "/student/attendance/viewAttendance",
                label: "View Attendance",
                active: pathname === "/student/attendance/viewAttendance",
              },
            ],
          },
          {
            href: "/student/wel/locations",
            label: "W.E.L Locations",
            active: pathname.includes("/student/wel/locations"),
            icon: File, // Using File icon, similar to admin
            submenus: [],
          },
        ],
      },
      {
        groupLabel: "Student Settings",
        menus: [
          {
            href: "/student/account",
            label: "Account",
            active: pathname.includes("/student/account"),
            icon: Settings,
            submenus: [],
          },
        ],
      },
    ];
  } else if (pathname.startsWith("/guardian")) {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/guardian/dashboard",
            label: "Dashboard",
            active: pathname.includes("/guardian/dashboard"),
            icon: LayoutGrid,
            submenus: [],
          },
        ],
      },
      {
        groupLabel: "Guardian Contents",
        menus: [
          {
            href: "/guardian/students",
            label: "Students",
            active: pathname.includes("/guardian/students"),
            icon: Users,
            submenus: [],
          },
        ],
      },
      {
        groupLabel: "Guardian Settings",
        menus: [
          {
            href: "/guardian/account",
            label: "Account",
            active: pathname.includes("/guardian/account"),
            icon: Settings,
            submenus: [],
          },
        ],
      },
    ];
  } else {
    return [];
  }
}
