<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-0 overflow-hidden">
        <!-- Toast Notifications -->
        <div class="fixed top-4 right-4 z-50 space-y-2">
            <transition-group name="toast">
                <div v-for="toast in toasts" :key="toast.id" :class="[
                    'px-4 py-3 rounded-lg text-white font-medium shadow-lg animate-in fade-in slide-in-from-right-4 duration-300',
                    toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-teal-600' : 'bg-blue-500'
                ]">
                    {{ toast.message }}
                </div>
            </transition-group>
        </div>
        <!-- Background Effects -->
        <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/5 rounded-full blur-3xl"></div>
        </div>

        <!-- Main Container -->
        <div class="w-screen h-screen grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
            <!-- Left Column -->
            <div class="hidden lg:flex lg:flex-col lg:justify-between p-12 bg-gradient-to-br from-slate-800 to-slate-900 border-r border-slate-700/50">
                <div>
                    <div class="inline-flex items-center gap-3 mb-20">
                        <div class="w-11 h-11 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center shadow-lg shadow-teal-600/20">
                            <svg viewBox="0 0 64 64" class="w-6 h-6 text-white" fill="currentColor"><path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 52c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"/></svg>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white">ShiftFlow</h1>
                            <p class="text-slate-400 text-xs font-medium tracking-wide">GESTIÓN INTELIGENTE</p>
                        </div>
                    </div>
                    <div class="space-y-8 mt-16">
                        <div class="group">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-teal-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600/20 transition-colors">
                                    <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10 10.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-white mb-1">Gestión Centralizada</h3>
                                    <p class="text-slate-400 text-xs leading-relaxed">Organiza todos tus turnos y equipos desde un único panel intuitivo</p>
                                </div>
                            </div>
                        </div>
                        <div class="group">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-teal-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600/20 transition-colors">
                                    <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-white mb-1">Colaboración Fluida</h3>
                                    <p class="text-slate-400 text-xs leading-relaxed">Comunica, coordina y resuelve cambios en tiempo real</p>
                                </div>
                            </div>
                        </div>
                        <div class="group">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-teal-600/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-600/20 transition-colors">
                                    <svg class="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>
                                </div>
                                <div>
                                    <h3 class="text-sm font-semibold text-white mb-1">Reportes Avanzados</h3>
                                    <p class="text-slate-400 text-xs leading-relaxed">Análisis detallados y métricas en tiempo real</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center gap-2 text-slate-400 text-xs">
                        <div class="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>Seguridad Empresarial</span>
                    </div>
                    <div class="flex items-center gap-2 text-slate-400 text-xs">
                        <div class="w-2 h-2 bg-teal-600 rounded-full"></div>
                        <span>GDPR Compliant</span>
                    </div>
                    <p class="text-slate-500 text-xs pt-4 border-t border-slate-700">© 2026 ShiftFlow. Todos los derechos reservados.</p>
                </div>
            </div>

            <!-- Right Column -->
            <div class="flex flex-col justify-center px-6 sm:px-12 py-16 sm:py-20 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl lg:rounded-none">
                <div class="w-full max-w-sm mx-auto">
                    <div class="mb-10">
                        <h2 class="text-4xl font-bold text-white mb-3">{{ isRegister ? 'Crear Cuenta' : 'Acceso' }}</h2>
                        <p class="text-slate-400 text-sm leading-relaxed">{{ isRegister ? 'Ingresa tus datos para comenzar a gestionar tus turnos' : 'Accede a tu cuenta de ShiftFlow' }}</p>
                    </div>

                    <form @submit.prevent="isRegister ? handleRegister() : handleLogin()" class="space-y-4">
                        <div v-if="isRegister" class="space-y-2.5">
                            <label class="block text-sm font-medium text-slate-300">Nombre Completo</label>
                            <input v-model="form.name" type="text" placeholder="Juan Pérez" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-white placeholder-slate-500"/>
                            <span v-if="errors.name" class="text-red-400 text-xs">{{ errors.name }}</span>
                        </div>

                        <div class="space-y-2.5">
                            <label class="block text-sm font-medium text-slate-300">Email</label>
                            <input v-model="form.email" type="email" placeholder="tu@empresa.com" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-white placeholder-slate-500"/>
                            <span v-if="errors.email" class="text-red-400 text-xs">{{ errors.email }}</span>
                        </div>

                        <div class="space-y-2.5">
                            <label class="block text-sm font-medium text-slate-300">Contraseña</label>
                            <div class="relative">
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="isRegister ? 'Mínimo 8 caracteres' : 'Tu contraseña'" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-white placeholder-slate-500 pr-10"/>
                                <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-teal-400">
                                    <svg v-if="!showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/></svg>
                                </button>
                            </div>
                            <span v-if="errors.password" class="text-red-400 text-xs">{{ errors.password }}</span>
                        </div>

                        <div v-if="isRegister" class="space-y-2.5">
                            <label class="block text-sm font-medium text-slate-300">Confirmar Contraseña</label>
                            <div class="relative">
                                <input v-model="form.password_confirmation" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Repite la contraseña" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-white placeholder-slate-500 pr-10"/>
                                <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-teal-400">
                                    <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/></svg>
                                </button>
                            </div>
                            <span v-if="errors.password_confirmation" class="text-red-400 text-xs">{{ errors.password_confirmation }}</span>
                        </div>

                        <div v-else class="flex items-center justify-between pt-2">
                            <label class="flex items-center gap-2"><input v-model="form.remember" type="checkbox" class="w-4 h-4 bg-slate-800 border-slate-700 rounded accent-teal-600"/><span class="text-sm text-slate-400">Recuérdame</span></label>
                            <a href="#" class="text-sm text-teal-600 hover:text-teal-400">¿Olvidaste?</a>
                        </div>

                        <div v-if="isRegister" class="flex items-start gap-2 pt-2">
                            <input v-model="form.terms" type="checkbox" id="terms" class="w-4 h-4 bg-slate-800 border-slate-700 rounded accent-teal-600 mt-0.5 flex-shrink-0"/>
                            <label for="terms" class="text-xs text-slate-400">Acepto los <a href="#" class="text-teal-600 underline">términos de servicio</a> y la <a href="#" class="text-teal-600 underline">política de privacidad</a></label>
                        </div>



                        <button type="submit" :disabled="loading" class="w-full mt-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <span v-if="!loading">{{ isRegister ? 'Crear Cuenta' : 'Entrar' }}</span>
                            <svg v-else class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        </button>
                    </form>

                    <div class="flex items-center gap-3 my-8"><div class="flex-1 h-px bg-slate-700"></div><span class="text-xs text-slate-500 uppercase font-medium">O</span><div class="flex-1 h-px bg-slate-700"></div></div>

                    <div class="text-center">
                        <p class="text-slate-400 text-sm mb-4">{{ isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}</p>
                        <button @click="toggleMode()" type="button" class="text-teal-600 hover:text-teal-400 font-semibold text-sm">{{ isRegister ? 'Accede aquí' : 'Regístrate aquí' }}</button>
                    </div>

                    <div class="lg:hidden mt-12 pt-8 border-t border-slate-700 flex items-center gap-2 text-slate-500">
                        <svg class="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 64 64"><path d="M32 4C16.536 4 4 16.536 4 32s12.536 28 28 28 28-12.536 28-28S47.464 4 32 4zm0 52c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"/></svg>
                        <span class="text-xs">© 2026 ShiftFlow</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import api from '@/Utils/api';

const isRegister = ref(false);
const form = ref({name: '', email: '', password: '', password_confirmation: '', remember: false, terms: false});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errors = ref({});

// Toast notification system
const toasts = ref([]);
const showToast = (message, type = 'error', duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type };
    toasts.value.push(toast);
    if (duration > 0) setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id); }, duration);
};

const toggleMode = () => { isRegister.value = !isRegister.value; errors.value = {}; };

const validateForm = () => {
    errors.value = {};
    if (isRegister.value) {
        if (!form.value.name) errors.value.name = 'Nombre requerido';
        if (!form.value.email) errors.value.email = 'Email requerido';
        if (!form.value.password) errors.value.password = 'Contraseña requerida';
        if (form.value.password.length < 8) errors.value.password = 'Mínimo 8 caracteres';
        if (form.value.password !== form.value.password_confirmation) errors.value.password_confirmation = 'No coinciden';
        if (!form.value.terms) { showToast('Debes aceptar los términos'); return false; }
    } else {
        if (!form.value.email) errors.value.email = 'Email requerido';
        if (!form.value.password) errors.value.password = 'Contraseña requerida';
    }
    return Object.keys(errors.value).length === 0;
};

const handleLogin = async () => {
    if (!validateForm()) return;
    loading.value = true;
    try {
        const response = await api.post('/auth/login', {email: form.value.email, password: form.value.password, remember: form.value.remember});
        localStorage.setItem('token', response.data.token);
        window.location.href = '/';
    } catch (err) {
        showToast(err.response?.data?.message || 'Error al iniciar sesión', 'error');
    } finally {
        loading.value = false;
    }
};

const handleRegister = async () => {
    if (!validateForm()) return;
    loading.value = true;
    try {
        await api.post('/auth/register', {name: form.value.name, email: form.value.email, password: form.value.password, password_confirmation: form.value.password_confirmation, role: 'trabajador'});
        showToast('¡Cuenta creada! Inicia sesión.', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
    } catch (err) {
        const msg = err.response?.data?.errors?.role?.[0] || err.response?.data?.message || 'Error al registrarse';
        showToast(msg, 'error');
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
</style>
