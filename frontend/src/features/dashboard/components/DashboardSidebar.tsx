import { FiCalendar, FiCreditCard, FiLogOut, FiUsers } from "react-icons/fi";
import { BrandRow } from "../../../components/BrandRow";
import type { DashboardTab, Usuario } from "../../../types/gym";

type DashboardSidebarProps = {
  activeTab: DashboardTab;
  currentUser: Usuario;
  onLogout: () => void;
  onTabChange: (tab: DashboardTab) => void;
};

export function DashboardSidebar({
  activeTab,
  currentUser,
  onLogout,
  onTabChange,
}: DashboardSidebarProps) {
  return (
    <aside className="dashboard-sidebar">
      <BrandRow className="sidebar-brand" />

      <div className="sidebar-user">
        <span>Sesion</span>
        <strong>{currentUser.nombre ?? currentUser.usuario}</strong>
        <small>@{currentUser.usuario}</small>
      </div>

      <nav className="sidebar-nav" aria-label="Secciones del dashboard">
        <button
          className={activeTab === "socios" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("socios")}
        >
          <FiUsers />
          Socios
        </button>
        <button
          className={activeTab === "pagos" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("pagos")}
        >
          <FiCreditCard />
          Pagos
        </button>
        <button
          className={activeTab === "planes" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("planes")}
        >
          <FiCalendar />
          Planes
        </button>
      </nav>

      <button className="logout-button" type="button" onClick={onLogout}>
        <FiLogOut />
        Cerrar sesion
      </button>
    </aside>
  );
}
