import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarNavComponent } from '../../../shared/components/sidebar-nav.component';
import { StatCardComponent, type StatCard } from '../../../shared/components/stat-card.component';
import { EmployeeCardComponent, type Employee } from '../../../shared/components/employee-card.component';
import { HeaderComponent } from '../../../shared/components/header.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarNavComponent,
    StatCardComponent,
    EmployeeCardComponent,
    HeaderComponent
  ],
  template: `
    <div class="min-h-screen bg-slate-100 dark:bg-slate-950">
      <!-- TopNavBar Component -->
      <app-header></app-header>

      <!-- Main Content Layout -->
      <main class="relative flex min-h-screen pt-16">
      <!-- SideNavBar (Dynamic Island style) -->
      <app-sidebar-nav></app-sidebar-nav>

      <!-- Content Canvas -->
      <div class="flex-1 px-8 py-8 md:mr-24">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h2 class="text-slate-400 text-sm font-semibold uppercase tracking-[0.2em] mb-1">Panel de Control</h2>
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión Operativa</h1>
          </div>
          <div class="flex gap-3">
            <div class="flex -space-x-2">
              <img
                *ngFor="let avatar of teamAvatars().slice(0, 3)"
                [src]="avatar"
                alt="Team"
                class="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <div class="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                +12
              </div>
            </div>
            <button class="bg-slate-100 px-6 py-2.5 rounded-lg text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors">
              Exportar Datos
            </button>
          </div>
        </div>

        <!-- Statistics Row -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <!-- Metric Cards -->
          <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-stat-card *ngFor="let card of statCards()" [card]="card"></app-stat-card>
          </div>

          <!-- Reports and Audit Section -->
          <div class="lg:col-span-4 bg-slate-900 p-8 rounded-xl relative overflow-hidden text-white flex flex-col justify-center border border-slate-800">
            <div class="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div class="relative z-10">
              <h4 class="text-2xl font-extrabold mb-1 tracking-tight text-white">Reportes del Sistema</h4>
              <p class="text-slate-400 text-sm mb-6 leading-relaxed">
                Genera y descarga informes detallados de la plataforma.
              </p>
              <div class="flex flex-col gap-3">
                <button class="flex items-center justify-between w-full bg-slate-800 hover:bg-slate-700 transition-all px-4 py-3 rounded-lg group border border-slate-700/50">
                  <span class="text-sm font-semibold text-slate-100">Generar Reporte de Usuarios</span>
                  <span class="material-symbols-outlined text-lg text-teal-500 group-hover:translate-x-1 transition-transform">download</span>
                </button>
                <button class="flex items-center justify-between w-full bg-slate-800 hover:bg-slate-700 transition-all px-4 py-3 rounded-lg group border border-slate-700/50">
                  <span class="text-sm font-semibold text-slate-100">Auditoría de Acceso</span>
                  <span class="material-symbols-outlined text-lg text-teal-500 group-hover:translate-x-1 transition-transform">history_edu</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Employees Section -->
        <section>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 class="text-xl font-bold text-slate-900">Directorio de Empleados</h3>
            <div class="flex items-center gap-3">
              <button class="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">filter_list</span>
                Filtrar
              </button>
              <button class="bg-teal-600 text-white flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-teal-900/10 hover:translate-y-[-2px] transition-all">
                <span class="material-symbols-outlined text-lg">person_add</span>
                Nuevo Empleado
              </button>
            </div>
          </div>

          <!-- Employees Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <app-employee-card *ngFor="let employee of employees()" [employee]="employee"></app-employee-card>
          </div>
        </section>
      </div>
    </main>

    <!-- Background Elements -->
    <div class="fixed top-0 right-0 -z-10 w-1/3 h-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>
    <div class="fixed bottom-0 left-0 -z-10 w-1/4 h-1/2 bg-slate-500/5 blur-[100px] pointer-events-none"></div>
    </div>
  `,
  styles: []
})
export class AdminDashboardComponent implements OnInit {
  statCards = signal<StatCard[]>([
    {
      icon: 'groups',
      iconBgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      label: 'Total Usuarios',
      value: '1,248',
      trend: '+4.2%',
      trendColor: 'teal'
    },
    {
      icon: 'bolt',
      iconBgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      label: 'Turnos Activos',
      value: '84',
      trend: 'En tiempo real',
      trendColor: 'amber'
    }
  ]);

  employees = signal<Employee[]>([
    {
      id: 1,
      name: 'Carlos Ruiz',
      position: 'Supervisor de Turno',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBES_cokasD5dZRbOU6O0hkCkGYAjqSwB2o316lQYuf5FLKpXDt2kMhTkWy58WbXMwiTPVg5vdjf2O7B8-rM0ZNjvLuB3oE1BgHl6YEVIkQSlDHTK6iGPkZ5cUrMTYWRnkZtnaLJgsyS66-jqIHIt7nkIKXcUeUIm8BnpCG_AGp5U05GKDoO83S1iZa8Iy22qouFTl8lhjG6rFltkvIx6RP_mfsOE6ERVK5ySQvyexH8xniA_o2TpqvwdWSIWD_GWOfUhXljkPh5pUl',
      status: 'ACTIVO',
      productivity: 94,
      seniority: '2 años'
    },
    {
      id: 2,
      name: 'Elena Vargas',
      position: 'Logística Senior',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOWKbBc7UAmfXAHE5w-pxZ5dG5tPIge56gjJxTEWqqCbzeMZUyzCkPnbbQ6SUkSx9BcOqYID8uqg-XcWY3gpWCbI22ffoA0MmOaKIfxjSXDAgK-soHfzli2DnQevwlMNTaQL3H-2bEkEXXQ-pZEyDctQULJR4t4ZRBD3fYEJ4CA8hqzSFxcKDXD1_vLWuwJwO3uissler0MQFE-83dP7jHTNZCvReVrKFOU8OpkbGNkmqWWXS-RDR3PC-NH1tUKqjhSM_GunpCkR-6',
      status: 'ACTIVO',
      productivity: 88,
      seniority: '4 años'
    },
    {
      id: 3,
      name: 'Miguel Torres',
      position: 'Mantenimiento',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAMNQrrUrglNNK7bzRUJK6VsAbDivpG5Ddq5xPB6ii-ClUUDLJG3X_B2TA2eTQKwnV4-Z9Sb-RK-H5G4kKN9NY7JFXa0LHohcjMk3k2h22ZA-F1nW3GgzWGWed75iue4Y8anIWPMv6zGANvskAUb2ybBbDANflLzo_X69Rjk3yD-wPAAOu-fsmPF5S98TPP4KaawTCMRaHTVXVUDAEYlJSlXBADs39GnbtT-YvLEWQhXce68C0maP0FwIDUmukBW7MzW2cXQLw4ojo',
      status: 'EN RECESO',
      productivity: 91,
      seniority: '1 año'
    },
    {
      id: 4,
      name: 'Sofía Méndez',
      position: 'Operador de Planta',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQkOesNimi5roDBRIAv34aazk03wwn0JiKM-OPsCHXIHK4pwENG_vneaRXY2B7xyeyqPhS_l_B2N0lQNuLivS-wdOIjWRCvp2CWQ63YoV5Z0B46I_eeRjLeFQONOszuffebr-Frfob8EsvHkCsalvRhy_JdcE3VDRRfGTzi2aNn9kWkM69ycwLwXGviAS6YiKNDlYmND0BT_Vlq7ktVR44JbsS0p3E-sYBbtfn3l5jqzNP-30SpBlWPVPR1Tvy4oJEWJF9u3rBviAB',
      status: 'ACTIVO',
      productivity: 96,
      seniority: '5 meses'
    },
    {
      id: 5,
      name: 'Roberto Díaz',
      position: 'Analista de Calidad',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGQMvFJVsVUjr4kymMHsD9YlFcckK1VbmWpHXlgg4PdhSIpxU-sjTLZNe1cmBz2Jn9nXT13IhBzurvq941Eq4XIrhPeYhw62niHhjrRGRmMJTZBIsPiKZVRkyid1ImeT2EWgLZ1tNK31F-9hWczv5ORJ-wFE9DyyKlx0cp7clqhABish3wPZGrqt_iTrsleQxyUQQ8C44G16P7veqYRIMTE8cB_8tXg_yGffCM3l5_lzKKcZ7dW2VW0sEsZ64uIDZWW9q-zZEt_MRc',
      status: 'ACTIVO',
      productivity: 82,
      seniority: '3 años'
    },
    {
      id: 6,
      name: 'Lucía Ferrán',
      position: 'Coordinadora RRHH',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfwRs8n6mqkgrgaWdbVV425C2j0iso7m5Mb8EJdn7DK8tWz-ulsGTb1QsLAdp8yYXsvNZX43h8DQn4JJuOhtfP8hcW0bmEbNVG3bZZrE6h9xUm-CKEel81jokpHMYgB-M7dQhT8plk6Dbj5A8iYlOeGR9k4Y4nI9-fOSmmrYSX0_hsApBhvhtEuhO-94ATONETol7IO3h-cJCQ2gi7u91TaLreiyJInyHzMntHR7_5V5J_vXnS6c9vMXVhUbgpdODQ1DsyUESe1vfp',
      status: 'ACTIVO',
      productivity: 98,
      seniority: '6 años'
    }
  ]);

  teamAvatars = signal<string[]>([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDzHI-vkRpKEsLrv63_d-3fifFoRRbsvx0QxTKWCbE6cEaH5RJ6Uj1BPokWWoq2g22MfFPuE9U_XBtriaqmYGoYhWGBGuqOeOsaaYnfx09vXW7fxOcfk8yXlrrFEcqjbelDGZi2H88CKn9vVxOes-TrAbPiF3gDVcDkpb2YVHxaDYXbSEikn8YRnRLH2JsQeCKwk85S2-f45FNZo84tCXJUx0o5naLUARpY3a3uUgpNZ9k6pEvGQVfdLkNR6terMtsjCKy0ityS8pCV',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnrDefxQuoy5gW7dQvBvpjB5cd_c89GJNHLdB_MZeUdON79i90OHo1Sgfejrsgn8dGIfxj2i1ry59Y3bR_o_evG4Ck4FhO2widn7FB7uzk_fh4Ry8d7gbLhBnfSMoGY2UVwd08aSoYtafOYX3rVXhF7clnTMoEXTCwMKKi0SuT7RdeuW0MA4R_9N3NfKuHCbfK24PsxjoTnxN8iajyIlJ5rloKQRW-UgIyrcD1euXNZzmZLEmBp5Yj3-NlplbtzfFJFzBc6bRU_4I',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBBxojYsIIQwCdKbHsRQ99wN8p0dCHfgP39yW_jP0L8i3d87vJYRYyMLRHWJ2VjPRpc7f0PRRiLiE1049ghoCYeqGqZP00MI6S4Igd5q61pV4ZHj1QTe7Va08DRkhYWRnkZtnaLJgsyS66-jqIHIt7nkIKXcUeUIm8BnpCG_AGp5U05GKDoO83S1iZa8Iy22qouFTl8lhjG6rFltkvIx6RP_mfsOE6ERVK5ySQvyexH8xniA_o2TpqvwdWSIWD_GWOfUhXljkPh5pUl'
  ]);

  ngOnInit() {
    // TODO: Cargar datos reales del backend
    console.log('Admin Dashboard initialized');
  }
}
