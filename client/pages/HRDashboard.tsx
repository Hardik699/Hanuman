import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plus,
  Users,
  User,
  Building2,
  Calendar,
  Clock,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  CalendarDays,
  UserCheck,
  UserX,
  Upload,
  Image,
  FileText,
  CreditCard,
  Landmark,
  Edit,
  MoreVertical,
  Filter,
  Download,
  Save,
  X,
  Eye,
} from "lucide-react";
import AppNav from "@/components/Navigation";

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM format
  year: number;
  totalWorkingDays: number;
  actualWorkingDays: number;
  basicSalary: number;
  bonus?: number;
  deductions?: number;
  totalSalary: number;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

interface Employee {
  id: string;
  employeeId: string; // Auto-generated employee ID
  // Personal Information
  fullName: string;
  fatherName: string;
  motherName: string;
  birthDate: string;
  bloodGroup: string;
  mobileNumber: string;
  emergencyMobileNumber: string;
  alternativeMobileNumber: string;
  email: string;
  address: string;
  permanentAddress: string;
  photo?: string;

  // Job Information
  joiningDate: string;
  department: string;
  position: string;
  tableNumber: string;

  // Banking Details
  accountNumber: string;
  ifscCode: string;
  bankPassbook?: string;
  aadhaarNumber: string;
  panNumber: string;
  uanNumber: string;
  salary: string;

  // Document Uploads
  aadhaarCard?: string;
  panCard?: string;
  passport?: string;
  drivingLicense?: string;
  resume?: string;
  medicalCertificate?: string;
  educationCertificate?: string;
  experienceLetter?: string;

  status: "active" | "inactive";
  deactivationReason?: string;
  resignationLetter?: string;
  deactivationDate?: string;
}

interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  sl1Start?: string;
  sl1End?: string;
  sl2Start?: string;
  sl2End?: string;
  notes?: string;
}

export default function HRDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // Employee form state
  const [newEmployee, setNewEmployee] = useState({
    // Personal Information
    fullName: "",
    fatherName: "",
    motherName: "",
    birthDate: "",
    bloodGroup: "",
    mobileNumber: "",
    emergencyMobileNumber: "",
    alternativeMobileNumber: "",
    email: "",
    address: "",
    permanentAddress: "",
    photo: "",

    // Job Information
    joiningDate: "",
    department: "",
    position: "",
    tableNumber: "",

    // Banking Details
    accountNumber: "",
    ifscCode: "",
    bankPassbook: "",
    aadhaarNumber: "",
    panNumber: "",
    uanNumber: "",
    salary: "",

    // Document Uploads
    aadhaarCard: "",
    panCard: "",
    passport: "",
    drivingLicense: "",
    resume: "",
    medicalCertificate: "",
    educationCertificate: "",
    experienceLetter: "",
  });

  // File upload states
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [passbookPreview, setPassbookPreview] = useState<string>("");
  const [documentPreviews, setDocumentPreviews] = useState<{
    [key: string]: string;
  }>({});

  // Department form state
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    manager: "",
  });

  // Edit department state
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [editDepartmentForm, setEditDepartmentForm] = useState({
    name: "",
    manager: "",
  });

  // Filter states
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedDepartmentView, setSelectedDepartmentView] = useState<
    string | null
  >(null);

  // Deactivation modal state
  const [deactivationModal, setDeactivationModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    reason: string;
    resignationLetter: string;
  }>({
    isOpen: false,
    employee: null,
    reason: "",
    resignationLetter: "",
  });

  // Employee detail modal state
  const [employeeDetailModal, setEmployeeDetailModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    isEditing: boolean;
    editForm: Partial<Employee>;
    activeTab: "details" | "salary";
  }>({
    isOpen: false,
    employee: null,
    isEditing: false,
    editForm: {},
    activeTab: "details",
  });

  // Photo edit state
  const [editPhotoPreview, setEditPhotoPreview] = useState<string>("");

  // Salary management state
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [salaryForm, setSalaryForm] = useState({
    month: "",
    totalWorkingDays: "",
    actualWorkingDays: "",
    basicSalary: "",
    bonus: "",
    deductions: "",
    paymentDate: "",
    notes: "",
  });
  const [showSalaryForm, setShowSalaryForm] = useState(false);

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceDayMap, setAttendanceDayMap] = useState<
    Record<string, AttendanceRecord>
  >({});

  const saveAttendanceRecords = (updated: AttendanceRecord[]) => {
    setAttendanceRecords(updated);
    localStorage.setItem("attendanceRecords", JSON.stringify(updated));
  };

  // Document preview modal state
  const [documentPreviewModal, setDocumentPreviewModal] = useState<{
    isOpen: boolean;
    documentUrl: string;
    documentType: string;
    employeeName: string;
  }>({
    isOpen: false,
    documentUrl: "",
    documentType: "",
    employeeName: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Blood groups
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Check authentication and admin access
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const role = localStorage.getItem("userRole");

    if (!isAuthenticated) {
      navigate("/login");
    } else if (role !== "admin") {
      navigate("/"); // Redirect non-admin users to home
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  // Load data from localStorage
  useEffect(() => {
    if (userRole === "admin") {
      const savedEmployees = localStorage.getItem("hrEmployees");
      const savedDepartments = localStorage.getItem("departments");
      const savedLeaveRequests = localStorage.getItem("leaveRequests");
      const savedSalaryRecords = localStorage.getItem("salaryRecords");
      const savedAttendanceRecords = localStorage.getItem("attendanceRecords");

      if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
      if (savedDepartments) setDepartments(JSON.parse(savedDepartments));
      if (savedLeaveRequests) setLeaveRequests(JSON.parse(savedLeaveRequests));
      if (savedSalaryRecords) setSalaryRecords(JSON.parse(savedSalaryRecords));
      if (savedAttendanceRecords)
        setAttendanceRecords(JSON.parse(savedAttendanceRecords));

      // Initialize with default departments if none exist
      if (!savedDepartments) {
        const defaultDepartments = [
          {
            id: "1",
            name: "Engineering",
            manager: "John Smith",
            employeeCount: 0,
          },
          {
            id: "2",
            name: "Marketing",
            manager: "Sarah Johnson",
            employeeCount: 0,
          },
          { id: "3", name: "Sales", manager: "Mike Davis", employeeCount: 0 },
          { id: "4", name: "HR", manager: "Lisa Wilson", employeeCount: 0 },
          {
            id: "5",
            name: "Finance",
            manager: "David Brown",
            employeeCount: 0,
          },
          {
            id: "6",
            name: "Operations",
            manager: "Emma Wilson",
            employeeCount: 0,
          },
        ];
        setDepartments(defaultDepartments);
        localStorage.setItem("departments", JSON.stringify(defaultDepartments));
      }
    }
  }, [userRole]);

  // Prepare attendance day map for active employees on selected date
  useEffect(() => {
    if (userRole !== "admin") return;
    const active = employees.filter((e) => e.status === "active");
    const map: Record<string, AttendanceRecord> = {};
    active.forEach((emp) => {
      const existing = attendanceRecords.find(
        (r) => r.employeeId === emp.id && r.date === selectedDate,
      );
      map[emp.id] =
        existing ||
        ({
          employeeId: emp.id,
          date: selectedDate,
          present: true,
        } as AttendanceRecord);
    });
    setAttendanceDayMap(map);
  }, [userRole, employees, attendanceRecords, selectedDate]);

  // Save data to localStorage
  const saveEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    localStorage.setItem("hrEmployees", JSON.stringify(updatedEmployees));
  };

  const saveDepartments = (updatedDepartments: Department[]) => {
    setDepartments(updatedDepartments);
    localStorage.setItem("departments", JSON.stringify(updatedDepartments));
  };

  const saveLeaveRequests = (updatedRequests: LeaveRequest[]) => {
    setLeaveRequests(updatedRequests);
    localStorage.setItem("leaveRequests", JSON.stringify(updatedRequests));
  };

  const saveSalaryRecords = (updatedRecords: SalaryRecord[]) => {
    setSalaryRecords(updatedRecords);
    localStorage.setItem("salaryRecords", JSON.stringify(updatedRecords));
  };

  // Handle file uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotoPreview(result);
        setNewEmployee({ ...newEmployee, photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPassbookPreview(result);
        setNewEmployee({ ...newEmployee, bankPassbook: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload =
    (documentType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setDocumentPreviews({ ...documentPreviews, [documentType]: result });
          setNewEmployee({ ...newEmployee, [documentType]: result });
        };
        reader.readAsDataURL(file);
      }
    };

  // Handle photo upload for edit form
  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setEditPhotoPreview(result);
        handleEditFormChange("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document upload within Edit modal
  const handleEditDocumentUpload =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        handleEditFormChange(key, result);
      };
      reader.readAsDataURL(file);
    };

  // Handle employee creation
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newEmployee.fullName ||
      !newEmployee.email ||
      !newEmployee.department ||
      !newEmployee.tableNumber
    ) {
      alert(
        "Please fill in required fields (Full Name, Email, Department, Table Number)",
      );
      return;
    }
    const used = new Set(
      employees
        .filter((e) => e.status === "active" && e.tableNumber)
        .map((e) => parseInt(e.tableNumber, 10))
        .filter((n) => !Number.isNaN(n)),
    );
    const chosen = parseInt(newEmployee.tableNumber, 10);
    if (Number.isNaN(chosen) || chosen < 1 || chosen > 32 || used.has(chosen)) {
      alert(
        "Selected table number is invalid or already assigned to an active employee",
      );
      return;
    }

    setIsLoading(true);

    const employee: Employee = {
      id: Date.now().toString(),
      employeeId: `EMP${Date.now().toString().slice(-4)}`,
      ...newEmployee,
      status: "active",
    };

    const updatedEmployees = [...employees, employee];
    saveEmployees(updatedEmployees);

    // Update department employee count
    const updatedDepartments = departments.map((dept) =>
      dept.name === newEmployee.department
        ? { ...dept, employeeCount: dept.employeeCount + 1 }
        : dept,
    );
    saveDepartments(updatedDepartments);

    // Sync to database (auto)
    try {
      await fetch("/api/hr/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-role": "admin" },
        body: JSON.stringify(employee),
      });
    } catch (err) {
      console.warn("Failed to sync employee to DB", err);
    }

    // Add notification for IT department
    const pendingITNotifications = JSON.parse(
      localStorage.getItem("pendingITNotifications") || "[]",
    );
    const itNotification = {
      id: employee.id,
      employeeId: employee.id,
      employeeName: employee.fullName,
      department: employee.department,
      tableNumber: employee.tableNumber,
      email: employee.email,
      createdAt: new Date().toISOString(),
      processed: false,
    };
    pendingITNotifications.push(itNotification);
    localStorage.setItem(
      "pendingITNotifications",
      JSON.stringify(pendingITNotifications),
    );

    // Reset form
    setNewEmployee({
      fullName: "",
      fatherName: "",
      motherName: "",
      birthDate: "",
      bloodGroup: "",
      mobileNumber: "",
      emergencyMobileNumber: "",
      alternativeMobileNumber: "",
      email: "",
      address: "",
      permanentAddress: "",
      photo: "",
      joiningDate: "",
      department: "",
      position: "",
      tableNumber: "",
      accountNumber: "",
      ifscCode: "",
      bankPassbook: "",
      aadhaarNumber: "",
      panNumber: "",
      uanNumber: "",
      salary: "",
      aadhaarCard: "",
      panCard: "",
      passport: "",
      drivingLicense: "",
      resume: "",
      medicalCertificate: "",
      educationCertificate: "",
      experienceLetter: "",
    });
    setPhotoPreview("");
    setPassbookPreview("");
    setDocumentPreviews({});
    setIsLoading(false);

    // Notify done (no inline IT data stored)
    alert("Employee created. IT department notified.");
  };

  // Handle employee status toggle
  const handleToggleEmployeeStatus = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (employee.status === "active") {
      // If deactivating, open the deactivation modal
      handleOpenDeactivationModal(employee);
    } else {
      // If activating, directly activate without modal
      const updatedEmployees = employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              status: "active" as const,
              deactivationReason: undefined,
              deactivationDate: undefined,
            }
          : emp,
      );
      saveEmployees(updatedEmployees);
    }
  };

  // Handle department editing
  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setEditDepartmentForm({
      name: department.name,
      manager: department.manager,
    });
  };

  const handleUpdateDepartment = () => {
    if (
      !editingDepartment ||
      !editDepartmentForm.name ||
      !editDepartmentForm.manager
    ) {
      alert("Please fill in all fields");
      return;
    }

    const updatedDepartments = departments.map((dept) =>
      dept.id === editingDepartment.id
        ? {
            ...dept,
            name: editDepartmentForm.name,
            manager: editDepartmentForm.manager,
          }
        : dept,
    );
    saveDepartments(updatedDepartments);

    // Update employees if department name changed
    if (editingDepartment.name !== editDepartmentForm.name) {
      const updatedEmployees = employees.map((emp) =>
        emp.department === editingDepartment.name
          ? { ...emp, department: editDepartmentForm.name }
          : emp,
      );
      saveEmployees(updatedEmployees);
    }

    setEditingDepartment(null);
    setEditDepartmentForm({ name: "", manager: "" });
  };

  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
    setEditDepartmentForm({ name: "", manager: "" });
  };

  // Handle department creation
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name || !newDepartment.manager) {
      alert("Please fill in all fields");
      return;
    }

    const department: Department = {
      id: Date.now().toString(),
      name: newDepartment.name,
      manager: newDepartment.manager,
      employeeCount: 0,
    };

    const updatedDepartments = [...departments, department];
    saveDepartments(updatedDepartments);

    // Reset form
    setNewDepartment({ name: "", manager: "" });
  };

  // Handle employee deletion
  const handleDeleteEmployee = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return;

    if (
      confirm(
        `Are you sure you want to delete employee "${employee.fullName}"?`,
      )
    ) {
      const updatedEmployees = employees.filter((emp) => emp.id !== employeeId);
      saveEmployees(updatedEmployees);

      // Update department employee count
      const updatedDepartments = departments.map((dept) =>
        dept.name === employee.department
          ? { ...dept, employeeCount: Math.max(0, dept.employeeCount - 1) }
          : dept,
      );
      saveDepartments(updatedDepartments);
    }
  };

  // Utility functions
  const getEmployeesByDepartment = (departmentName: string) => {
    return employees.filter((emp) => emp.department === departmentName);
  };

  const getFilteredEmployees = () => {
    return employees.filter((emp) => {
      const statusMatch =
        employeeStatusFilter === "all" || emp.status === employeeStatusFilter;
      const departmentMatch =
        departmentFilter === "all" || emp.department === departmentFilter;
      return statusMatch && departmentMatch;
    });
  };

  // Deactivation functions
  const handleOpenDeactivationModal = (employee: Employee) => {
    setDeactivationModal({
      isOpen: true,
      employee,
      reason: "",
      resignationLetter: "",
    });
  };

  const handleCloseDeactivationModal = () => {
    setDeactivationModal({
      isOpen: false,
      employee: null,
      reason: "",
      resignationLetter: "",
    });
  };

  const handleResignationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDeactivationModal((prev) => ({
          ...prev,
          resignationLetter: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeactivateEmployee = () => {
    if (
      !deactivationModal.employee ||
      !deactivationModal.reason ||
      !deactivationModal.resignationLetter
    ) {
      alert("Please provide a reason and upload resignation letter");
      return;
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === deactivationModal.employee!.id
        ? {
            ...emp,
            status: "inactive" as const,
            deactivationReason: deactivationModal.reason,
            resignationLetter: deactivationModal.resignationLetter,
            deactivationDate: new Date().toISOString().split("T")[0],
          }
        : emp,
    );
    saveEmployees(updatedEmployees);
    handleCloseDeactivationModal();
  };

  // Copy employee information
  const copyEmployeeInfo = (employee: Employee) => {
    const info = `
=== EMPLOYEE INFORMATION ===

Personal Details:
Name: ${employee.fullName}
Father's Name: ${employee.fatherName || "N/A"}
Mother's Name: ${employee.motherName || "N/A"}
Birth Date: ${employee.birthDate || "N/A"}
Blood Group: ${employee.bloodGroup || "N/A"}
Email: ${employee.email}
Mobile: ${employee.mobileNumber}
Emergency Mobile: ${employee.emergencyMobileNumber || "N/A"}
Address: ${employee.address || "N/A"}

Job Information:
Department: ${employee.department}
Position: ${employee.position || "N/A"}
Joining Date: ${employee.joiningDate || "N/A"}
Table Number: ${employee.tableNumber || "N/A"}
Salary: ${employee.salary || "N/A"}
Status: ${employee.status}

Banking Details:
Account Number: ${employee.accountNumber || "N/A"}
IFSC Code: ${employee.ifscCode || "N/A"}
Aadhaar Number: ${employee.aadhaarNumber || "N/A"}
PAN Number: ${employee.panNumber || "N/A"}
UAN Number: ${employee.uanNumber || "N/A"}

${
  employee.status === "inactive" && employee.deactivationReason
    ? `
Deactivation Details:
Reason: ${employee.deactivationReason}
Date: ${employee.deactivationDate || "N/A"}
Resignation Letter: ${employee.resignationLetter ? "On File" : "Not Available"}
`
    : ""
}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    navigator.clipboard
      .writeText(info)
      .then(() => {
        alert("Employee information copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy information");
      });
  };

  // Employee detail modal functions
  const handleOpenEmployeeDetail = (employee: Employee) => {
    setEmployeeDetailModal({
      isOpen: true,
      employee,
      isEditing: false,
      editForm: {},
      activeTab: "details",
    });
  };

  const handleOpenEmployeeEdit = (employee: Employee) => {
    setEmployeeDetailModal({
      isOpen: true,
      employee,
      isEditing: true,
      editForm: { ...employee },
      activeTab: "details",
    });
    setEditPhotoPreview(employee.photo || "");
  };

  const handleCloseEmployeeDetail = () => {
    setEmployeeDetailModal({
      isOpen: false,
      employee: null,
      isEditing: false,
      editForm: {},
      activeTab: "details",
    });
    // Clear photo preview
    setEditPhotoPreview("");
  };

  const handleStartEdit = () => {
    if (employeeDetailModal.employee) {
      setEmployeeDetailModal((prev) => ({
        ...prev,
        isEditing: true,
        editForm: { ...prev.employee! },
      }));
      // Initialize photo preview with current photo
      setEditPhotoPreview(employeeDetailModal.employee.photo || "");
    }
  };

  const handleCancelEdit = () => {
    setEmployeeDetailModal((prev) => ({
      ...prev,
      isEditing: false,
      editForm: {},
    }));
    // Clear photo preview
    setEditPhotoPreview("");
  };

  const handleSaveEmployee = () => {
    if (!employeeDetailModal.employee || !employeeDetailModal.editForm) return;

    const pendingTable =
      (employeeDetailModal.editForm.tableNumber as string) ??
      employeeDetailModal.employee.tableNumber;
    if (pendingTable) {
      const n = parseInt(pendingTable, 10);
      const taken = new Set(
        employees
          .filter(
            (e) =>
              e.status === "active" &&
              e.id !== employeeDetailModal.employee!.id &&
              e.tableNumber,
          )
          .map((e) => parseInt(e.tableNumber, 10))
          .filter((x) => !Number.isNaN(x)),
      );
      if (Number.isNaN(n) || n < 1 || n > 32 || taken.has(n)) {
        alert(
          "Selected table number is invalid or already assigned to an active employee",
        );
        return;
      }
    }

    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeDetailModal.employee!.id
        ? { ...emp, ...employeeDetailModal.editForm }
        : emp,
    );

    saveEmployees(updatedEmployees);
    setEmployeeDetailModal((prev) => ({
      ...prev,
      employee: { ...prev.employee!, ...prev.editForm },
      isEditing: false,
      editForm: {},
    }));
    alert("Employee information updated successfully!");
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEmployeeDetailModal((prev) => ({
      ...prev,
      editForm: { ...prev.editForm, [field]: value },
    }));
  };

  // Salary management functions
  const getEmployeeSalaryRecords = (employeeId: string) => {
    return salaryRecords
      .filter((record) => record.employeeId === employeeId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  };

  const handleAddSalaryRecord = () => {
    if (
      !employeeDetailModal.employee ||
      !salaryForm.month ||
      !salaryForm.totalWorkingDays ||
      !salaryForm.actualWorkingDays ||
      !salaryForm.basicSalary
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const basicSalary = parseFloat(salaryForm.basicSalary);
    const bonus = parseFloat(salaryForm.bonus) || 0;
    const deductions = parseFloat(salaryForm.deductions) || 0;
    const totalSalary = basicSalary + bonus - deductions;

    // Check if record already exists for this month
    const existingRecord = salaryRecords.find(
      (record) =>
        record.employeeId === employeeDetailModal.employee!.id &&
        record.month === salaryForm.month,
    );

    if (existingRecord) {
      alert(
        "Salary record already exists for this month. Please edit the existing record.",
      );
      return;
    }

    const newRecord: SalaryRecord = {
      id: Date.now().toString(),
      employeeId: employeeDetailModal.employee.id,
      month: salaryForm.month,
      year: parseInt(salaryForm.month.split("-")[0]),
      totalWorkingDays: parseInt(salaryForm.totalWorkingDays),
      actualWorkingDays: parseInt(salaryForm.actualWorkingDays),
      basicSalary: basicSalary,
      bonus: bonus || undefined,
      deductions: deductions || undefined,
      totalSalary: totalSalary,
      paymentDate: salaryForm.paymentDate || undefined,
      notes: salaryForm.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedRecords = [...salaryRecords, newRecord];
    saveSalaryRecords(updatedRecords);

    // Reset form
    setSalaryForm({
      month: "",
      totalWorkingDays: "",
      actualWorkingDays: "",
      basicSalary: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
      notes: "",
    });
    setShowSalaryForm(false);
    alert("Salary record added successfully!");
  };

  const handleDeleteSalaryRecord = (recordId: string) => {
    if (confirm("Are you sure you want to delete this salary record?")) {
      const updatedRecords = salaryRecords.filter(
        (record) => record.id !== recordId,
      );
      saveSalaryRecords(updatedRecords);
    }
  };

  const resetSalaryForm = () => {
    setSalaryForm({
      month: "",
      totalWorkingDays: "",
      actualWorkingDays: "",
      basicSalary: "",
      bonus: "",
      deductions: "",
      paymentDate: "",
      notes: "",
    });
    setShowSalaryForm(false);
  };

  // Document preview functions
  const handleOpenDocumentPreview = (
    documentUrl: string,
    documentType: string,
    employeeName: string,
  ) => {
    setDocumentPreviewModal({
      isOpen: true,
      documentUrl,
      documentType,
      employeeName,
    });
  };

  const handleCloseDocumentPreview = () => {
    setDocumentPreviewModal({
      isOpen: false,
      documentUrl: "",
      documentType: "",
      employeeName: "",
    });
  };

  const documentTypes = [
    { key: "aadhaarCard", label: "Aadhaar Card", icon: CreditCard },
    { key: "panCard", label: "PAN Card", icon: CreditCard },
    { key: "passport", label: "Passport", icon: FileText },
    { key: "drivingLicense", label: "Driving License", icon: CreditCard },
    { key: "resume", label: "Resume/CV", icon: FileText },
    { key: "medicalCertificate", label: "Medical Certificate", icon: FileText },
    {
      key: "educationCertificate",
      label: "Education Certificate",
      icon: FileText,
    },
    { key: "experienceLetter", label: "Experience Letter", icon: FileText },
  ];

  useEffect(() => {
    if (userRole !== "admin") return;
    const seeded = localStorage.getItem("demoEmployeesSeeded");
    if (seeded) return;

    const savedEmployees: Employee[] = JSON.parse(
      localStorage.getItem("hrEmployees") || "[]",
    );
    const savedDepartments: Department[] = JSON.parse(
      localStorage.getItem("departments") || "[]",
    );

    if (savedEmployees.length >= 2) {
      localStorage.setItem("demoEmployeesSeeded", "1");
      return;
    }

    const img =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

    const emp1: Employee = {
      id: `${Date.now()}-1`,
      employeeId: `EMP${(Date.now() + 1).toString().slice(-4)}`,
      fullName: "Rahul Sharma",
      fatherName: "Mahesh Sharma",
      motherName: "Suman Sharma",
      birthDate: "1990-05-12",
      bloodGroup: "B+",
      mobileNumber: "+91 9876543210",
      emergencyMobileNumber: "+91 9000000000",
      alternativeMobileNumber: "+91 9999999999",
      email: "rahul.sharma@example.com",
      address: "A-12, Sector 21, Noida, UP",
      permanentAddress: "Jaipur, Rajasthan",
      photo: img,
      joiningDate: "2023-04-01",
      department: "Engineering",
      position: "Software Engineer",
      tableNumber: "5",
      accountNumber: "012345678901",
      ifscCode: "HDFC0001234",
      bankPassbook: img,
      aadhaarNumber: "1234 5678 9012",
      panNumber: "ABCDE1234F",
      uanNumber: "100200300400",
      salary: "65000",
      aadhaarCard: img,
      panCard: img,
      passport: img,
      drivingLicense: img,
      resume: img,
      medicalCertificate: img,
      educationCertificate: img,
      experienceLetter: img,
      status: "active",
    };

    const emp2: Employee = {
      id: `${Date.now()}-2`,
      employeeId: `EMP${(Date.now() + 2).toString().slice(-4)}`,
      fullName: "Priya Verma",
      fatherName: "Rakesh Verma",
      motherName: "Anita Verma",
      birthDate: "1994-11-23",
      bloodGroup: "O+",
      mobileNumber: "+91 9876543211",
      emergencyMobileNumber: "+91 8888888888",
      alternativeMobileNumber: "+91 7777777777",
      email: "priya.verma@example.com",
      address: "B-55, Andheri East, Mumbai",
      permanentAddress: "Lucknow, UP",
      photo: img,
      joiningDate: "2022-09-15",
      department: "HR",
      position: "HR Executive",
      tableNumber: "6",
      accountNumber: "098765432109",
      ifscCode: "SBI0004321",
      bankPassbook: img,
      aadhaarNumber: "9012 3456 7890",
      panNumber: "PQRSX1234Z",
      uanNumber: "400300200100",
      salary: "42000",
      aadhaarCard: img,
      panCard: img,
      passport: img,
      drivingLicense: img,
      resume: img,
      medicalCertificate: img,
      educationCertificate: img,
      experienceLetter: img,
      status: "active",
    };

    const newEmployees = [emp1, emp2];
    const updatedEmployees = [...savedEmployees, ...newEmployees];
    saveEmployees(updatedEmployees);

    const deptCounts = (name: string) =>
      updatedEmployees.filter(
        (e) => e.department === name && e.status === "active",
      ).length;
    if (savedDepartments.length === 0) {
      const defaultDepartments: Department[] = [
        {
          id: "1",
          name: "Engineering",
          manager: "John Smith",
          employeeCount: 0,
        },
        {
          id: "2",
          name: "Marketing",
          manager: "Sarah Johnson",
          employeeCount: 0,
        },
        { id: "3", name: "Sales", manager: "Mike Davis", employeeCount: 0 },
        { id: "4", name: "HR", manager: "Lisa Wilson", employeeCount: 0 },
        { id: "5", name: "Finance", manager: "David Brown", employeeCount: 0 },
        {
          id: "6",
          name: "Operations",
          manager: "Emma Wilson",
          employeeCount: 0,
        },
      ];
      const seededDepartments = defaultDepartments.map((d) => ({
        ...d,
        employeeCount: deptCounts(d.name),
      }));
      saveDepartments(seededDepartments);
    } else {
      const updatedDepartments = savedDepartments.map((d) => ({
        ...d,
        employeeCount: deptCounts(d.name),
      }));
      saveDepartments(updatedDepartments);
    }

    const pending = JSON.parse(
      localStorage.getItem("pendingITNotifications") || "[]",
    );
    const newNotifs = newEmployees.map((employee) => ({
      id: employee.id,
      employeeId: employee.id,
      employeeName: employee.fullName,
      department: employee.department,
      tableNumber: employee.tableNumber,
      email: employee.email,
      createdAt: new Date().toISOString(),
      processed: false,
    }));
    localStorage.setItem(
      "pendingITNotifications",
      JSON.stringify([...pending, ...newNotifs]),
    );

    localStorage.setItem("demoEmployeesSeeded", "1");
  }, [userRole]);

  // Load employees from DB (if available) and sync local copy
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/hr/employees", {
          headers: { "x-role": "admin" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length) {
          const mapped = data.items.map((e: any) => ({
            id: e.id || Date.now().toString(),
            employeeId: e.employeeId || `EMP${(e.id || "").slice(-4)}`,
            fullName: e.fullName || "Unknown",
            fatherName: e.fatherName || "",
            motherName: e.motherName || "",
            birthDate: e.birthDate || "",
            bloodGroup: e.bloodGroup || "",
            mobileNumber: e.mobileNumber || "",
            emergencyMobileNumber: e.emergencyMobileNumber || "",
            alternativeMobileNumber: e.alternativeMobileNumber || "",
            email: e.email || "",
            address: e.address || "",
            permanentAddress: e.permanentAddress || "",
            photo: e.photo || "",
            joiningDate: e.joiningDate || "",
            department: e.department || "General",
            position: e.position || "",
            tableNumber: e.tableNumber || "",
            accountNumber: e.accountNumber || "",
            ifscCode: e.ifscCode || "",
            bankPassbook: e.bankPassbook || "",
            aadhaarNumber: e.aadhaarNumber || "",
            panNumber: e.panNumber || "",
            uanNumber: e.uanNumber || "",
            salary: e.salary || "",
            aadhaarCard: e.aadhaarCard || "",
            panCard: e.panCard || "",
            passport: e.passport || "",
            drivingLicense: e.drivingLicense || "",
            resume: e.resume || "",
            medicalCertificate: e.medicalCertificate || "",
            educationCertificate: e.educationCertificate || "",
            experienceLetter: e.experienceLetter || "",
            status: e.status || "active",
            deactivationReason: e.deactivationReason,
            resignationLetter: e.resignationLetter,
            deactivationDate: e.deactivationDate,
          }));
          setEmployees(mapped);
          localStorage.setItem("hrEmployees", JSON.stringify(mapped));
        }
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deep-900 via-blue-deep-800 to-slate-900">
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">HR Dashboard</h1>
            <p className="text-slate-400">Human Resources Management System</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {employees.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Departments</p>
                  <p className="text-2xl font-semibold text-white">
                    {departments.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {employees.filter((emp) => emp.status === "active").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Inactive Employees</p>
                  <p className="text-2xl font-semibold text-white">
                    {
                      employees.filter((emp) => emp.status === "inactive")
                        .length
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <UserX className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
            <TabsTrigger
              value="employees"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </TabsTrigger>
            <TabsTrigger
              value="employee-details"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Employee Details
            </TabsTrigger>
            <TabsTrigger
              value="departments"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="leaves"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Leave Requests
            </TabsTrigger>
          </TabsList>

          {/* Add Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 gap-8">
              {/* Add Employee Form */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                    <span>Add New Employee</span>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete employee registration form with all required
                    information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEmployee} className="space-y-8">
                    {/* Photo Upload Section */}
                    <div className="flex justify-end">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30 overflow-hidden">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Employee"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <Image className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                              <p className="text-xs text-slate-500">
                                Employee Photo
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <User className="h-5 w-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Personal Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full-name" className="text-slate-300">
                            Full Name *
                          </Label>
                          <Input
                            id="full-name"
                            value={newEmployee.fullName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                fullName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="father-name"
                            className="text-slate-300"
                          >
                            Father's Name
                          </Label>
                          <Input
                            id="father-name"
                            value={newEmployee.fatherName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                fatherName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="mother-name"
                            className="text-slate-300"
                          >
                            Mother's Name
                          </Label>
                          <Input
                            id="mother-name"
                            value={newEmployee.motherName}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                motherName: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="birth-date"
                            className="text-slate-300"
                          >
                            Birth Date
                          </Label>
                          <Input
                            id="birth-date"
                            type="date"
                            value={newEmployee.birthDate}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                birthDate: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Blood Group</Label>
                          <Select
                            value={newEmployee.bloodGroup}
                            onValueChange={(value) =>
                              setNewEmployee({
                                ...newEmployee,
                                bloodGroup: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select blood group" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {bloodGroups.map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-300">
                            Email ID *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                email: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mobile" className="text-slate-300">
                            Mobile Number
                          </Label>
                          <Input
                            id="mobile"
                            value={newEmployee.mobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                mobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="emergency-mobile"
                            className="text-slate-300"
                          >
                            Emergency Mobile
                          </Label>
                          <Input
                            id="emergency-mobile"
                            value={newEmployee.emergencyMobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                emergencyMobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="alternative-mobile"
                            className="text-slate-300"
                          >
                            Alternative Number
                          </Label>
                          <Input
                            id="alternative-mobile"
                            value={newEmployee.alternativeMobileNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                alternativeMobileNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-slate-300">
                            Current Address
                          </Label>
                          <Textarea
                            id="address"
                            value={newEmployee.address}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                address: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white h-20"
                            placeholder="Enter current address..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="permanent-address"
                            className="text-slate-300"
                          >
                            Permanent Address
                          </Label>
                          <Textarea
                            id="permanent-address"
                            value={newEmployee.permanentAddress}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                permanentAddress: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white h-20"
                            placeholder="Enter permanent address..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Job Information Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Briefcase className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Job Information
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="joining-date"
                            className="text-slate-300"
                          >
                            Joining Date
                          </Label>
                          <Input
                            id="joining-date"
                            type="date"
                            value={newEmployee.joiningDate}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                joiningDate: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Department *</Label>
                          <Select
                            value={newEmployee.department}
                            onValueChange={(value) =>
                              setNewEmployee({
                                ...newEmployee,
                                department: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position" className="text-slate-300">
                            Position
                          </Label>
                          <Input
                            id="position"
                            value={newEmployee.position}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                position: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="Software Engineer"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Table Number</Label>
                          <Select
                            value={newEmployee.tableNumber}
                            onValueChange={(val) =>
                              setNewEmployee({
                                ...newEmployee,
                                tableNumber: val,
                              })
                            }
                          >
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select table (1-32)" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60 overflow-y-auto">
                              {Array.from({ length: 32 }, (_, i) => i + 1)
                                .filter(
                                  (n) =>
                                    !new Set(
                                      employees
                                        .filter(
                                          (e) =>
                                            e.status === "active" &&
                                            e.tableNumber,
                                        )
                                        .map((e) => parseInt(e.tableNumber, 10))
                                        .filter((n) => !Number.isNaN(n)),
                                    ).has(n),
                                )
                                .map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Banking Details Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Landmark className="h-5 w-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Banking Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="account-number"
                            className="text-slate-300"
                          >
                            Account Number
                          </Label>
                          <Input
                            id="account-number"
                            value={newEmployee.accountNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                accountNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="1234567890123456"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ifsc-code" className="text-slate-300">
                            IFSC Code
                          </Label>
                          <Input
                            id="ifsc-code"
                            value={newEmployee.ifscCode}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                ifscCode: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="SBIN0001234"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="salary" className="text-slate-300">
                            Salary
                          </Label>
                          <Input
                            id="salary"
                            value={newEmployee.salary}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                salary: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="₹50,000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="aadhaar-number"
                            className="text-slate-300"
                          >
                            Aadhaar Number
                          </Label>
                          <Input
                            id="aadhaar-number"
                            value={newEmployee.aadhaarNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                aadhaarNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="1234 5678 9012"
                            maxLength={14}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="pan-number"
                            className="text-slate-300"
                          >
                            PAN Number
                          </Label>
                          <Input
                            id="pan-number"
                            value={newEmployee.panNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                panNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="ABCDE1234F"
                            maxLength={10}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="uan-number"
                            className="text-slate-300"
                          >
                            UAN Number
                          </Label>
                          <Input
                            id="uan-number"
                            value={newEmployee.uanNumber}
                            onChange={(e) =>
                              setNewEmployee({
                                ...newEmployee,
                                uanNumber: e.target.value,
                              })
                            }
                            className="bg-slate-800/50 border-slate-700 text-white"
                            placeholder="123456789012"
                          />
                        </div>
                      </div>

                      {/* Bank Passbook Upload */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-orange-400" />
                          <Label className="text-slate-300">
                            Bank Passbook Upload
                          </Label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handlePassbookUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Passbook
                            </Button>
                          </div>
                          {passbookPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  passbookPreview,
                                  "Bank Passbook",
                                  newEmployee.fullName || "New Employee",
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          )}
                          {passbookPreview && (
                            <div className="flex items-center space-x-2 text-green-400 text-sm">
                              <FileText className="h-4 w-4" />
                              <span>File uploaded successfully</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Document Uploads Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Upload className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Document Uploads
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {documentTypes.map((docType) => {
                          const IconComponent = docType.icon;
                          const isUploaded = documentPreviews[docType.key];

                          return (
                            <div key={docType.key} className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4 text-purple-400" />
                                <Label className="text-slate-300">
                                  {docType.label}
                                </Label>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onChange={handleDocumentUpload(docType.key)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`border-slate-600 text-slate-300 ${isUploaded ? "border-green-500 text-green-400" : ""}`}
                                  >
                                    <Upload className="h-3 w-3 mr-2" />
                                    {isUploaded ? "Replace" : "Upload"}
                                  </Button>
                                </div>
                                {isUploaded && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300"
                                    onClick={() =>
                                      handleOpenDocumentPreview(
                                        documentPreviews[docType.key],
                                        docType.label,
                                        newEmployee.fullName || "New Employee",
                                      )
                                    }
                                  >
                                    <Eye className="h-3 w-3 mr-2" />
                                    Preview
                                  </Button>
                                )}
                                {isUploaded && (
                                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                                    <FileText className="h-3 w-3" />
                                    <span>Uploaded ✓</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                        <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span>Upload Guidelines</span>
                        </h4>
                        <ul className="text-slate-400 text-sm space-y-1">
                          <li>• Supported formats: JPG, PNG, PDF, DOC, DOCX</li>
                          <li>• Maximum file size: 10MB per document</li>
                          <li>• Ensure documents are clear and readable</li>
                          <li>
                            • All documents are securely stored and encrypted
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                      >
                        {isLoading ? "Adding Employee..." : "Add Employee"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employee Details Tab */}
          <TabsContent value="employee-details" className="space-y-6">
            {/* Employee Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Status Filter */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Filter className="h-5 w-5 text-blue-400" />
                      <span className="text-white font-medium">
                        Filter by Status:
                      </span>
                    </div>
                    <Tabs
                      value={employeeStatusFilter}
                      onValueChange={(value) =>
                        setEmployeeStatusFilter(
                          value as "all" | "active" | "inactive",
                        )
                      }
                      className="w-auto"
                    >
                      <TabsList className="bg-slate-800/50 border border-slate-700">
                        <TabsTrigger
                          value="all"
                          className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                        >
                          All ({employees.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="active"
                          className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Active (
                          {
                            employees.filter((emp) => emp.status === "active")
                              .length
                          }
                          )
                        </TabsTrigger>
                        <TabsTrigger
                          value="inactive"
                          className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Inactive (
                          {
                            employees.filter((emp) => emp.status === "inactive")
                              .length
                          }
                          )
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Department Filter */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Building2 className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">
                        Filter by Department:
                      </span>
                    </div>
                    <Select
                      value={departmentFilter}
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name} (
                            {getEmployeesByDepartment(dept.name).length})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Employees List */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <span>Employee Details</span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-700 text-slate-300"
                  >
                    {getFilteredEmployees().length} of {employees.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getFilteredEmployees().length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {employees.length === 0
                        ? "No employees added yet"
                        : `No ${employeeStatusFilter} employees found`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredEmployees().map((employee) => (
                      <div
                        key={employee.id}
                        className="p-4 bg-slate-800/30 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex space-x-4">
                            {employee.photo && (
                              <img
                                src={employee.photo}
                                alt={employee.fullName}
                                className="w-12 h-12 rounded-full object-cover border border-slate-600 cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() =>
                                  handleOpenEmployeeDetail(employee)
                                }
                                title="Click to view full details"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-white font-medium">
                                  {employee.fullName}
                                </h4>
                                <Button
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee.id)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className={`px-3 py-1 text-xs border ${
                                    employee.status === "active"
                                      ? "border-green-500 text-green-400 hover:bg-green-500/20"
                                      : "border-red-500 text-red-400 hover:bg-red-500/20"
                                  }`}
                                >
                                  {employee.status === "active" ? (
                                    <>
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="h-3 w-3 mr-1" />
                                      Inactive
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{employee.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Building2 className="h-3 w-3" />
                                  <span>{employee.department}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{employee.mobileNumber}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{employee.position}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-block h-3 w-3 text-slate-400">
                                    #
                                  </span>
                                  <span>
                                    Table {employee.tableNumber || "-"}
                                  </span>
                                </div>
                                {employee.joiningDate && (
                                  <div className="flex items-center space-x-2">
                                    <CalendarDays className="h-3 w-3" />
                                    <span>Joined: {employee.joiningDate}</span>
                                  </div>
                                )}
                                {employee.salary && (
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{employee.salary}</span>
                                  </div>
                                )}
                              </div>

                              {/* Deactivation Information for Inactive Employees */}
                              {employee.status === "inactive" &&
                                employee.deactivationReason && (
                                  <div className="mt-3 pt-3 border-t border-red-700/30">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <UserX className="h-4 w-4 text-red-400" />
                                        <span className="text-sm font-medium text-red-400">
                                          Deactivation Details
                                        </span>
                                      </div>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="text-slate-400">
                                            Reason:{" "}
                                          </span>
                                          <span className="text-slate-300">
                                            {employee.deactivationReason}
                                          </span>
                                        </div>
                                        {employee.deactivationDate && (
                                          <div>
                                            <span className="text-slate-400">
                                              Date:{" "}
                                            </span>
                                            <span className="text-slate-300">
                                              {employee.deactivationDate}
                                            </span>
                                          </div>
                                        )}
                                        {employee.resignationLetter && (
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-3 w-3 text-green-400" />
                                              <span className="text-green-400 text-xs">
                                                Resignation letter on file
                                              </span>
                                            </div>
                                            <Button
                                              onClick={() =>
                                                handleOpenDocumentPreview(
                                                  employee.resignationLetter!,
                                                  "Resignation Letter",
                                                  employee.fullName,
                                                )
                                              }
                                              variant="outline"
                                              size="sm"
                                              className="h-5 px-2 text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                                            >
                                              <Image className="h-2 w-2 mr-1" />
                                              View
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Document Status */}
                              <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-center space-x-2 mb-2">
                                  <FileText className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs text-slate-400">
                                    Documents:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {documentTypes.map((docType) => {
                                    const hasDoc =
                                      employee[docType.key as keyof Employee];
                                    return (
                                      <Badge
                                        key={docType.key}
                                        variant="secondary"
                                        className={`text-xs px-2 py-1 cursor-pointer ${
                                          hasDoc
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                            : "bg-slate-700/50 text-slate-500 border border-slate-600"
                                        }`}
                                        onClick={() => {
                                          if (hasDoc) {
                                            handleOpenDocumentPreview(
                                              hasDoc as string,
                                              docType.label,
                                              employee.fullName,
                                            );
                                          }
                                        }}
                                        title={
                                          hasDoc
                                            ? "Click to preview document"
                                            : "Document not uploaded"
                                        }
                                      >
                                        {docType.label.split(" ")[0]}{" "}
                                        {hasDoc ? "✓" : "✗"}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenEmployeeDetail(employee)
                                  }
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  View Full Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenEmployeeEdit(employee)
                                  }
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Employee
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyEmployeeInfo(employee)}
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Copy Employee Info
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee.id)
                                  }
                                  className="cursor-pointer hover:bg-slate-700"
                                >
                                  {employee.status === "active" ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Deactivate Employee
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activate Employee
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteEmployee(employee.id)
                                  }
                                  className="cursor-pointer hover:bg-red-600 text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Employee
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Department Form */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-blue-400" />
                    <span>Add New Department</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dept-name" className="text-slate-300">
                        Department Name
                      </Label>
                      <Input
                        id="dept-name"
                        value={newDepartment.name}
                        onChange={(e) =>
                          setNewDepartment({
                            ...newDepartment,
                            name: e.target.value,
                          })
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept-manager" className="text-slate-300">
                        Department Manager
                      </Label>
                      <Input
                        id="dept-manager"
                        value={newDepartment.manager}
                        onChange={(e) =>
                          setNewDepartment({
                            ...newDepartment,
                            manager: e.target.value,
                          })
                        }
                        className="bg-slate-800/50 border-slate-700 text-white"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Add Department
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Departments List */}
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-400" />
                    <span>Departments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map((department) => {
                      const departmentEmployees = getEmployeesByDepartment(
                        department.name,
                      );
                      const actualEmployeeCount = departmentEmployees.length;

                      return (
                        <div key={department.id} className="space-y-3">
                          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                            {editingDepartment?.id === department.id ? (
                              /* Edit Mode */
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-slate-300">
                                    Department Name
                                  </Label>
                                  <Input
                                    value={editDepartmentForm.name}
                                    onChange={(e) =>
                                      setEditDepartmentForm({
                                        ...editDepartmentForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-slate-300">
                                    Department Manager
                                  </Label>
                                  <Input
                                    value={editDepartmentForm.manager}
                                    onChange={(e) =>
                                      setEditDepartmentForm({
                                        ...editDepartmentForm,
                                        manager: e.target.value,
                                      })
                                    }
                                    className="bg-slate-800/50 border-slate-700 text-white"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={handleUpdateDepartment}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button
                                    onClick={handleCancelEditDepartment}
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-white font-medium text-lg">
                                      {department.name}
                                    </h4>
                                    <Badge
                                      variant="secondary"
                                      className="bg-slate-700 text-slate-300"
                                    >
                                      {actualEmployeeCount} employees
                                    </Badge>
                                  </div>
                                  <p className="text-slate-400 text-sm mb-3">
                                    Manager: {department.manager}
                                  </p>

                                  {/* Show/Hide Employees Button */}
                                  <Button
                                    onClick={() =>
                                      setSelectedDepartmentView(
                                        selectedDepartmentView ===
                                          department.name
                                          ? null
                                          : department.name,
                                      )
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    {selectedDepartmentView === department.name
                                      ? "Hide"
                                      : "Show"}{" "}
                                    Employees
                                  </Button>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleEditDepartment(department)
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Department Employees List */}
                          {selectedDepartmentView === department.name && (
                            <Card className="bg-slate-800/50 border-slate-600 ml-4">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-white text-base flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-blue-400" />
                                  <span>Employees in {department.name}</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {departmentEmployees.length === 0 ? (
                                  <div className="text-center py-4">
                                    <User className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">
                                      No employees in this department
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {departmentEmployees.map((employee) => (
                                      <div
                                        key={employee.id}
                                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                                      >
                                        <div className="flex items-center space-x-3">
                                          {employee.photo && (
                                            <img
                                              src={employee.photo}
                                              alt={employee.fullName}
                                              className="w-8 h-8 rounded-full object-cover border border-slate-500"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <h5 className="text-white text-sm font-medium">
                                                {employee.fullName}
                                              </h5>
                                              <Badge
                                                className={`text-xs ${
                                                  employee.status === "active"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                              >
                                                {employee.status}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 text-xs text-slate-400">
                                              <span>
                                                {employee.position ||
                                                  "No position set"}
                                              </span>
                                              <span className="flex items-center space-x-1">
                                                <Mail className="h-3 w-3" />
                                                <span>{employee.email}</span>
                                              </span>
                                              {employee.mobileNumber && (
                                                <span className="flex items-center space-x-1">
                                                  <Phone className="h-3 w-3" />
                                                  <span>
                                                    {employee.mobileNumber}
                                                  </span>
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <Button
                                            onClick={() =>
                                              handleToggleEmployeeStatus(
                                                employee.id,
                                              )
                                            }
                                            variant="outline"
                                            size="sm"
                                            className={`px-2 py-1 text-xs border ${
                                              employee.status === "active"
                                                ? "border-red-500 text-red-400 hover:bg-red-500/20"
                                                : "border-green-500 text-green-400 hover:bg-green-500/20"
                                            }`}
                                          >
                                            {employee.status === "active"
                                              ? "Deactivate"
                                              : "Activate"}
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span>Attendance Tracking</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Monitor employee attendance and working hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Attendance System
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Track employee check-ins, check-outs, and working hours
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-400"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave Requests Tab */}
          <TabsContent value="leaves" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-orange-400" />
                  <span>Leave Requests</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage employee leave requests and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Leave Management
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Handle vacation requests, sick leaves, and time-off
                    approvals
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/20 text-orange-400"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Deactivation Modal */}
        {deactivationModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <UserX className="h-5 w-5 text-red-400" />
                  <span>Deactivate Employee</span>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Provide reason and upload resignation letter (mandatory)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
                  <p className="text-white font-medium">
                    {deactivationModal.employee?.fullName}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {deactivationModal.employee?.department} -{" "}
                    {deactivationModal.employee?.position}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Reason for Deactivation *
                  </Label>
                  <Textarea
                    value={deactivationModal.reason}
                    onChange={(e) =>
                      setDeactivationModal((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="bg-slate-800/50 border-slate-700 text-white h-24"
                    placeholder="Enter reason for deactivation..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Upload Resignation Letter *
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleResignationUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className={`border-slate-600 text-slate-300 ${
                          deactivationModal.resignationLetter
                            ? "border-green-500 text-green-400"
                            : ""
                        }`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {deactivationModal.resignationLetter
                          ? "Replace File"
                          : "Upload File"}
                      </Button>
                    </div>
                    {deactivationModal.resignationLetter && (
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <FileText className="h-4 w-4" />
                        <span>File uploaded ✓</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                    <span className="font-medium">⚠️ Important:</span>
                  </div>
                  <p className="text-yellow-300 text-sm mt-1">
                    Both reason and resignation letter are mandatory for
                    employee deactivation.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleDeactivateEmployee}
                    disabled={
                      !deactivationModal.reason ||
                      !deactivationModal.resignationLetter
                    }
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate Employee
                  </Button>
                  <Button
                    onClick={handleCloseDeactivationModal}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employee Detail Modal */}
        {employeeDetailModal.isOpen && employeeDetailModal.employee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {(employeeDetailModal.isEditing
                      ? editPhotoPreview || employeeDetailModal.employee.photo
                      : employeeDetailModal.employee.photo) && (
                      <img
                        src={
                          employeeDetailModal.isEditing
                            ? editPhotoPreview ||
                              employeeDetailModal.employee.photo
                            : employeeDetailModal.employee.photo
                        }
                        alt={employeeDetailModal.employee.fullName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                      />
                    )}
                    <div>
                      <CardTitle className="text-white text-xl">
                        {employeeDetailModal.isEditing
                          ? "Edit Employee"
                          : "Employee Details"}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {employeeDetailModal.employee.fullName} -{" "}
                        {employeeDetailModal.employee.department}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                      <Button
                        onClick={() =>
                          setEmployeeDetailModal((prev) => ({
                            ...prev,
                            activeTab: "details",
                            isEditing: false,
                          }))
                        }
                        variant={
                          employeeDetailModal.activeTab === "details"
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className={`${employeeDetailModal.activeTab === "details" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        onClick={() =>
                          setEmployeeDetailModal((prev) => ({
                            ...prev,
                            activeTab: "salary",
                            isEditing: false,
                          }))
                        }
                        variant={
                          employeeDetailModal.activeTab === "salary"
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        className={`${employeeDetailModal.activeTab === "salary" ? "bg-blue-500 text-white" : "text-slate-300 hover:text-white"}`}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Salary
                      </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {employeeDetailModal.activeTab === "details" && (
                        <>
                          {!employeeDetailModal.isEditing ? (
                            <Button
                              onClick={handleStartEdit}
                              variant="outline"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={handleSaveEmployee}
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="border-slate-600 text-slate-300"
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      <Button
                        onClick={handleCloseEmployeeDetail}
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                {/* Photo Upload Section (Edit Mode Only) */}
                {employeeDetailModal.isEditing && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                      <Image className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">
                        Employee Photo
                      </h3>
                    </div>
                    <div className="flex items-center space-x-6">
                      {/* Current/New Photo Display */}
                      <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center bg-slate-800/30 overflow-hidden">
                        {editPhotoPreview ||
                        employeeDetailModal.employee.photo ? (
                          <img
                            src={
                              editPhotoPreview ||
                              employeeDetailModal.employee.photo
                            }
                            alt="Employee"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Image className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">No Photo</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Buttons */}
                      <div className="flex flex-col space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {employeeDetailModal.employee.photo
                              ? "Change Photo"
                              : "Add Photo"}
                          </Button>
                        </div>

                        {(editPhotoPreview ||
                          employeeDetailModal.employee.photo) && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditPhotoPreview("");
                              handleEditFormChange("photo", "");
                            }}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Photo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <User className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.fullName ||
                            employeeDetailModal.employee.fullName
                          }
                          onChange={(e) =>
                            handleEditFormChange("fullName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.fullName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Father's Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.fatherName ||
                            employeeDetailModal.employee.fatherName
                          }
                          onChange={(e) =>
                            handleEditFormChange("fatherName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.fatherName || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Mother's Name</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.motherName ||
                            employeeDetailModal.employee.motherName
                          }
                          onChange={(e) =>
                            handleEditFormChange("motherName", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.motherName || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Birth Date</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="date"
                          value={
                            employeeDetailModal.editForm.birthDate ||
                            employeeDetailModal.employee.birthDate
                          }
                          onChange={(e) =>
                            handleEditFormChange("birthDate", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.birthDate || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Blood Group</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            employeeDetailModal.editForm.bloodGroup ||
                            employeeDetailModal.employee.bloodGroup
                          }
                          onValueChange={(value) =>
                            handleEditFormChange("bloodGroup", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {bloodGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.bloodGroup || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="email"
                          value={
                            employeeDetailModal.editForm.email ||
                            employeeDetailModal.employee.email
                          }
                          onChange={(e) =>
                            handleEditFormChange("email", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Mobile Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.mobileNumber ||
                            employeeDetailModal.employee.mobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("mobileNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.mobileNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Emergency Mobile</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm
                              .emergencyMobileNumber ||
                            employeeDetailModal.employee.emergencyMobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "emergencyMobileNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.emergencyMobileNumber ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Alternative Number
                      </Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm
                              .alternativeMobileNumber ||
                            employeeDetailModal.employee.alternativeMobileNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "alternativeMobileNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee
                            .alternativeMobileNumber || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Current Address</Label>
                      {employeeDetailModal.isEditing ? (
                        <Textarea
                          value={
                            employeeDetailModal.editForm.address ||
                            employeeDetailModal.employee.address
                          }
                          onChange={(e) =>
                            handleEditFormChange("address", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white h-20"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700 min-h-[80px]">
                          {employeeDetailModal.employee.address || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">
                        Permanent Address
                      </Label>
                      {employeeDetailModal.isEditing ? (
                        <Textarea
                          value={
                            employeeDetailModal.editForm.permanentAddress ||
                            employeeDetailModal.employee.permanentAddress
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "permanentAddress",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white h-20"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700 min-h-[80px]">
                          {employeeDetailModal.employee.permanentAddress ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <Briefcase className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Job Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Department</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            employeeDetailModal.editForm.department ||
                            employeeDetailModal.employee.department
                          }
                          onValueChange={(value) =>
                            handleEditFormChange("department", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.department}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Position</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.position ||
                            employeeDetailModal.employee.position
                          }
                          onChange={(e) =>
                            handleEditFormChange("position", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.position || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Joining Date</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          type="date"
                          value={
                            employeeDetailModal.editForm.joiningDate ||
                            employeeDetailModal.employee.joiningDate
                          }
                          onChange={(e) =>
                            handleEditFormChange("joiningDate", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.joiningDate || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Table Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Select
                          value={
                            (employeeDetailModal.editForm
                              .tableNumber as string) ??
                            (employeeDetailModal.employee
                              .tableNumber as string) ??
                            ""
                          }
                          onValueChange={(val) =>
                            handleEditFormChange("tableNumber", val)
                          }
                        >
                          <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                            <SelectValue placeholder="Select table (1-32)" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-60 overflow-y-auto">
                            {Array.from({ length: 32 }, (_, i) => i + 1)
                              .filter((n) => {
                                const taken = new Set(
                                  employees
                                    .filter(
                                      (e) =>
                                        e.status === "active" &&
                                        e.id !==
                                          employeeDetailModal.employee!.id &&
                                        e.tableNumber,
                                    )
                                    .map((e) => parseInt(e.tableNumber, 10))
                                    .filter((x) => !Number.isNaN(x)),
                                );
                                return !taken.has(n);
                              })
                              .map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.tableNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Salary</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.salary ||
                            employeeDetailModal.employee.salary
                          }
                          onChange={(e) =>
                            handleEditFormChange("salary", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.salary || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            employeeDetailModal.employee.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        >
                          {employeeDetailModal.employee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <Landmark className="h-5 w-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Banking Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Account Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.accountNumber ||
                            employeeDetailModal.employee.accountNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "accountNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.accountNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">IFSC Code</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.ifscCode ||
                            employeeDetailModal.employee.ifscCode
                          }
                          onChange={(e) =>
                            handleEditFormChange("ifscCode", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.ifscCode || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Aadhaar Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.aadhaarNumber ||
                            employeeDetailModal.employee.aadhaarNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange(
                              "aadhaarNumber",
                              e.target.value,
                            )
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                          maxLength={14}
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.aadhaarNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">PAN Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.panNumber ||
                            employeeDetailModal.employee.panNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("panNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                          maxLength={10}
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.panNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">UAN Number</Label>
                      {employeeDetailModal.isEditing ? (
                        <Input
                          value={
                            employeeDetailModal.editForm.uanNumber ||
                            employeeDetailModal.employee.uanNumber
                          }
                          onChange={(e) =>
                            handleEditFormChange("uanNumber", e.target.value)
                          }
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      ) : (
                        <p className="text-white p-2 bg-slate-800/30 rounded border border-slate-700">
                          {employeeDetailModal.employee.uanNumber || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Document Status
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documentTypes.map((docType) => {
                      const hasDoc =
                        (employeeDetailModal.editForm[
                          docType.key as keyof Employee
                        ] as any) ||
                        employeeDetailModal.employee[
                          docType.key as keyof Employee
                        ];
                      const IconComponent = docType.icon;
                      return (
                        <div
                          key={docType.key}
                          className="p-4 h-full flex flex-col justify-between rounded-lg border border-slate-700 bg-slate-800/40 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex flex-wrap items-start gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <IconComponent className="h-4 w-4 text-purple-400" />
                              <div className="leading-tight">
                                <div className="text-slate-100 text-sm">
                                  {docType.label}
                                </div>
                                <div
                                  className={`text-xs ${hasDoc ? "text-green-400" : "text-slate-500"}`}
                                >
                                  {hasDoc ? "Uploaded" : "Missing"}
                                </div>
                              </div>
                            </div>
                            <div className="w-full ml-6 mt-2 flex items-center gap-2 flex-wrap">
                              {employeeDetailModal.isEditing && (
                                <>
                                  <input
                                    id={`edit-doc-${docType.key}`}
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={handleEditDocumentUpload(
                                      docType.key,
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      document
                                        .getElementById(
                                          `edit-doc-${docType.key}`,
                                        )
                                        ?.click()
                                    }
                                    className={`h-7 px-2 text-xs ${
                                      hasDoc
                                        ? "border-green-500 text-green-400"
                                        : "border-slate-600 text-slate-300"
                                    }`}
                                  >
                                    <Upload className="h-3 w-3 mr-1" />
                                    {hasDoc ? "Replace" : "Upload"}
                                  </Button>
                                </>
                              )}
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  hasDoc
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {hasDoc ? "✓" : "✗"}
                              </Badge>
                              {hasDoc && (
                                <Button
                                  onClick={() =>
                                    handleOpenDocumentPreview(
                                      hasDoc as string,
                                      docType.label,
                                      employeeDetailModal.employee.fullName,
                                    )
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs border-blue-500 text-blue-400 hover:bg-blue-500/20"
                                >
                                  <Image className="h-3 w-3 mr-1" />
                                  Preview
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Deactivation Details (if applicable) */}
                {employeeDetailModal.employee.status === "inactive" &&
                  employeeDetailModal.employee.deactivationReason && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-red-700/30 pb-2">
                        <UserX className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Deactivation Details
                        </h3>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                        <div>
                          <Label className="text-red-400 font-medium">
                            Reason:
                          </Label>
                          <p className="text-slate-300 mt-1">
                            {employeeDetailModal.employee.deactivationReason}
                          </p>
                        </div>
                        {employeeDetailModal.employee.deactivationDate && (
                          <div>
                            <Label className="text-red-400 font-medium">
                              Date:
                            </Label>
                            <p className="text-slate-300 mt-1">
                              {employeeDetailModal.employee.deactivationDate}
                            </p>
                          </div>
                        )}
                        {employeeDetailModal.employee.resignationLetter && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">
                                Resignation letter on file
                              </span>
                            </div>
                            <Button
                              onClick={() =>
                                handleOpenDocumentPreview(
                                  employeeDetailModal.employee
                                    .resignationLetter!,
                                  "Resignation Letter",
                                  employeeDetailModal.employee.fullName,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                            >
                              <Image className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Salary Tab Content */}
                {employeeDetailModal.activeTab === "salary" && (
                  <div className="space-y-6">
                    {/* Add Salary Form */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-400" />
                          <h3 className="text-lg font-semibold text-white">
                            Salary Management
                          </h3>
                        </div>
                        <Button
                          onClick={() => setShowSalaryForm(!showSalaryForm)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Salary Record
                        </Button>
                      </div>

                      {/* Salary Form */}
                      {showSalaryForm && (
                        <Card className="bg-slate-800/50 border-slate-700">
                          <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center space-x-2">
                              <DollarSign className="h-5 w-5 text-green-400" />
                              <span>Add New Salary Record</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Month *
                                </Label>
                                <Input
                                  type="month"
                                  value={salaryForm.month}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      month: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Total Working Days *
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={salaryForm.totalWorkingDays}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      totalWorkingDays: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="26"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Actual Working Days *
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="31"
                                  value={salaryForm.actualWorkingDays}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      actualWorkingDays: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="25"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Basic Salary *
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.basicSalary}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      basicSalary: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="50000"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Bonus (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.bonus}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      bonus: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="5000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Deductions (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={salaryForm.deductions}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      deductions: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="2000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">
                                  Payment Date (Optional)
                                </Label>
                                <Input
                                  type="date"
                                  value={salaryForm.paymentDate}
                                  onChange={(e) =>
                                    setSalaryForm({
                                      ...salaryForm,
                                      paymentDate: e.target.value,
                                    })
                                  }
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-300">
                                Notes (Optional)
                              </Label>
                              <Textarea
                                value={salaryForm.notes}
                                onChange={(e) =>
                                  setSalaryForm({
                                    ...salaryForm,
                                    notes: e.target.value,
                                  })
                                }
                                className="bg-slate-800/50 border-slate-700 text-white h-20"
                                placeholder="Any additional notes..."
                              />
                            </div>

                            {/* Calculated Total */}
                            {(salaryForm.basicSalary ||
                              salaryForm.bonus ||
                              salaryForm.deductions) && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-blue-400 font-medium">
                                    Total Salary:
                                  </span>
                                  <span className="text-white text-lg font-bold">
                                    ₹
                                    {(
                                      parseFloat(
                                        salaryForm.basicSalary || "0",
                                      ) +
                                      parseFloat(salaryForm.bonus || "0") -
                                      parseFloat(salaryForm.deductions || "0")
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                              <Button
                                onClick={handleAddSalaryRecord}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Add Record
                              </Button>
                              <Button
                                onClick={resetSalaryForm}
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Salary Records List */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-slate-700 pb-2">
                        <Clock className="h-5 w-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">
                          Salary History
                        </h3>
                      </div>

                      {(() => {
                        const employeeSalaryRecords = getEmployeeSalaryRecords(
                          employeeDetailModal.employee.id,
                        );
                        return employeeSalaryRecords.length === 0 ? (
                          <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-white font-medium mb-2">
                              No Salary Records
                            </h4>
                            <p className="text-slate-400 mb-4">
                              No salary records found for this employee.
                            </p>
                            <Button
                              onClick={() => setShowSalaryForm(true)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Record
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {employeeSalaryRecords.map((record) => (
                              <Card
                                key={record.id}
                                className="bg-slate-800/30 border-slate-700"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      <div>
                                        <h4 className="text-white font-medium">
                                          {new Date(
                                            record.month + "-01",
                                          ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                          })}
                                        </h4>
                                        <p className="text-slate-400 text-sm">
                                          {record.actualWorkingDays}/
                                          {record.totalWorkingDays} working days
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <p className="text-white font-bold text-lg">
                                          ₹{record.totalSalary.toLocaleString()}
                                        </p>
                                        {record.paymentDate && (
                                          <p className="text-slate-400 text-sm">
                                            Paid: {record.paymentDate}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        onClick={() =>
                                          handleDeleteSalaryRecord(record.id)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500 text-red-400 hover:bg-red-500/20"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-slate-400">
                                        Basic Salary
                                      </p>
                                      <p className="text-white font-medium">
                                        ₹{record.basicSalary.toLocaleString()}
                                      </p>
                                    </div>
                                    {record.bonus && record.bonus > 0 && (
                                      <div>
                                        <p className="text-slate-400">Bonus</p>
                                        <p className="text-green-400 font-medium">
                                          +₹{record.bonus.toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                    {record.deductions &&
                                      record.deductions > 0 && (
                                        <div>
                                          <p className="text-slate-400">
                                            Deductions
                                          </p>
                                          <p className="text-red-400 font-medium">
                                            -₹
                                            {record.deductions.toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                    <div>
                                      <p className="text-slate-400">Added On</p>
                                      <p className="text-white font-medium">
                                        {new Date(
                                          record.createdAt,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  {record.notes && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                      <p className="text-slate-400 text-sm">
                                        Notes:
                                      </p>
                                      <p className="text-slate-300 text-sm mt-1">
                                        {record.notes}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Preview Modal */}
        {documentPreviewModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <span>Document Preview</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {documentPreviewModal.documentType} -{" "}
                      {documentPreviewModal.employeeName}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleCloseDocumentPreview}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex items-center justify-center max-h-[70vh] overflow-auto">
                {documentPreviewModal.documentUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Check if it's an image */}
                    {documentPreviewModal.documentUrl.startsWith(
                      "data:image/",
                    ) ||
                    documentPreviewModal.documentUrl.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i,
                    ) ? (
                      <img
                        src={documentPreviewModal.documentUrl}
                        alt={documentPreviewModal.documentType}
                        className="max-w-full max-h-full object-contain rounded-lg border border-slate-600"
                      />
                    ) : documentPreviewModal.documentUrl.startsWith(
                        "data:application/pdf",
                      ) || documentPreviewModal.documentUrl.match(/\.pdf$/i) ? (
                      /* PDF Preview */
                      <div className="w-full h-full min-h-[500px] bg-slate-800/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-white font-medium mb-2">
                              PDF Document
                            </p>
                            <p className="text-slate-400 text-sm mb-4">
                              PDF preview not available in browser
                            </p>
                            <Button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = documentPreviewModal.documentUrl;
                                link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}.pdf`;
                                link.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Other file types */
                      <div className="w-full h-full min-h-[300px] bg-slate-800/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <FileText className="h-16 w-16 text-slate-400 mx-auto" />
                          <div>
                            <p className="text-white font-medium mb-2">
                              Document File
                            </p>
                            <p className="text-slate-400 text-sm mb-4">
                              Preview not available for this file type
                            </p>
                            <Button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = documentPreviewModal.documentUrl;
                                link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}`;
                                link.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download File
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      Document Not Available
                    </h3>
                    <p className="text-slate-400">
                      The document file could not be loaded.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardContent className="border-t border-slate-700 p-4 bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    <span className="font-medium text-slate-300">
                      Document Type:
                    </span>{" "}
                    {documentPreviewModal.documentType}
                  </div>
                  <div className="flex space-x-2">
                    {documentPreviewModal.documentUrl && (
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = documentPreviewModal.documentUrl;
                          link.download = `${documentPreviewModal.documentType}_${documentPreviewModal.employeeName}`;
                          link.click();
                        }}
                        variant="outline"
                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={handleCloseDocumentPreview}
                      className="bg-slate-600 hover:bg-slate-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
