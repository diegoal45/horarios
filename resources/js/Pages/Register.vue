<template>
    <div class="min-h-screen bg-slate-950 flex">
        <!-- Left Sidebar - Info Section -->
        <div class="hidden lg:flex lg:w-6/12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 relative overflow-hidden">
            <!-- Background pattern subtle -->
            <div class="absolute inset-0 opacity-5">
                <div class="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                <div class="absolute bottom-0 right-0 w-96 h-96 bg-slate-400 rounded-full blur-3xl"></div>
            </div>

            <div class="relative z-10 flex flex-col justify-center p-12 space-y-12">
                <!-- Logo Section -->
                <div>
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-slate-400 rounded-lg flex items-center justify-center">
                            <svg viewBox="0 0 64 64" class="w-8 h-8 text-slate-950" fill="currentColor">
                                <rect x="8" y="14" width="48" height="38" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="24" x2="56" y2="24" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="34" x2="56" y2="34" stroke="currentColor" stroke-width="2"/>
                                <line x1="8" y1="44" x2="56" y2="44" stroke="currentColor" stroke-width="2"/>
                                <circle cx="14" cy="28" r="1.5" fill="currentColor" opacity="0.8"/>
                                <circle cx="28" cy="28" r="1.5" fill="currentColor" opacity="0.6"/>
                                <circle cx="42" cy="28" r="1.5" fill="currentColor" opacity="0.4"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-2xl font-bold text-white">Horarios</h1>
                            <p class="text-xs text-slate-400 uppercase tracking-widest">Gestión de Turnos</p>
                        </div>
                    </div>
                    <div class="h-1 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
                </div>

                <!-- Features List -->
                <div class="space-y-8">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Únete a Nuestro Equipo</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">Acceso completo a herramientas de gestión de horarios profesionales.</p>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Sin Compromisos</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">Prueba gratis y cancela en cualquier momento. No se necesita tarjeta.</p>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Soporte 24/7</h3>
                        <p class="text-sm text-slate-400 leading-relaxed">Nuestro equipo está siempre disponible para ayudarte con cualquier pregunta.</p>
                    </div>
                </div>

                <!-- Bottom Info -->
                <div class="pt-8 border-t border-slate-700/50">
                    <p class="text-xs text-slate-500 mb-4">Protegemos tu información con encriptación de nivel empresarial</p>
                    <div class="flex gap-2">
                        <span class="text-xs text-slate-400">🔒 SSL Seguro</span>
                        <span class="text-xs text-slate-400">✓ GDPR Cumplido</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Section - Register Form -->
        <div class="w-full lg:w-6/12 bg-slate-950 flex flex-col justify-center items-center p-6 lg:p-12">
            <div class="w-full max-w-sm">
                <!-- Header -->
                <div class="mb-10">
                    <h2 class="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
                    <p class="text-slate-400 text-sm">Comienza en menos de 1 minuto</p>
                </div>

                <!-- Accent line -->
                <div class="h-0.5 w-10 bg-gradient-to-r from-blue-500 to-transparent mb-10 rounded-full"></div>

                <!-- Form Container with custom scroll -->
                <div class="max-h-[65vh] overflow-y-auto pr-2" style="scrollbar-width: thin; scrollbar-color: rgb(51, 65, 85) transparent;">
                    <form @submit.prevent="handleRegister" class="space-y-5">
                        <!-- Name Field -->
                        <div class="relative group">
                            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
                                Nombre Completo
                            </label>
                            <input
                                v-model="form.name"
                                type="text"
                                placeholder="Juan Pérez"
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 group-hover:border-slate-600"
                            />
                            <span v-if="errors.name" class="text-red-400 text-xs mt-2 block">{{ errors.name }}</span>
                        </div>

                        <!-- Email Field -->
                        <div class="relative group">
                            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
                                Correo Electrónico
                            </label>
                            <input
                                v-model="form.email"
                                type="email"
                                placeholder="tu@empresa.com"
                                class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 group-hover:border-slate-600"
                            />
                            <span v-if="errors.email" class="text-red-400 text-xs mt-2 block">{{ errors.email }}</span>
                        </div>

                        <!-- Password Field -->
                        <div class="relative group">
                            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
                                Contraseña
                            </label>
                            <div class="relative">
                                <input
                                    v-model="form.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="Mínimo 8 caracteres"
                                    class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 group-hover:border-slate-600"
                                />
                                <button
                                    type="button"
                                    @click="showPassword = !showPassword"
                                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <svg v-if="!showPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                            </div>
                            <span v-if="errors.password" class="text-red-400 text-xs mt-2 block">{{ errors.password }}</span>
                        </div>

                        <!-- Confirm Password Field -->
                        <div class="relative group">
                            <label class="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-3">
                                Confirmar Contraseña
                            </label>
                            <div class="relative">
                                <input
                                    v-model="form.password_confirmation"
                                    :type="showConfirmPassword ? 'text' : 'password'"
                                    placeholder="Repite la contraseña"
                                    class="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 group-hover:border-slate-600"
                                />
                                <button
                                    type="button"
                                    @click="showConfirmPassword = !showConfirmPassword"
                                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                            </div>
                            <span v-if="errors.password_confirmation" class="text-red-400 text-xs mt-2 block">{{ errors.password_confirmation }}</span>
                        </div>

                        <!-- Terms Acceptance -->
                        <div class="flex items-start gap-3 pt-2">
                            <input
                                v-model="form.terms"
                                type="checkbox"
                                id="terms"
                                class="w-4 h-4 mt-1 rounded border border-slate-600 bg-slate-900/50 checked:bg-blue-500 checked:border-blue-500 cursor-pointer accent-blue-500 transition-colors"
                            />
                            <label for="terms" class="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                Acepto los
                                <a href="#" class="text-blue-500 hover:text-blue-400">términos de servicio</a>
                                y la
                                <a href="#" class="text-blue-500 hover:text-blue-400">política de privacidad</a>
                            </label>
                        </div>

                        <!-- Error message -->
                        <div v-if="registerError" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                            {{ registerError }}
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            :disabled="loading"
                            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.005] active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed mt-8"
                        >
                            <span v-if="!loading">Crear Cuenta</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <svg class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Registrando...
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Divider -->
                <div class="flex items-center gap-3 my-8">
                    <div class="flex-1 h-px bg-slate-700"></div>
                    <span class="text-xs text-slate-500 uppercase">O</span>
                    <div class="flex-1 h-px bg-slate-700"></div>
                </div>

                <!-- Login Link -->
                <div class="text-center">
                    <p class="text-slate-400 text-sm">
                        ¿Ya tienes cuenta?
                        <a href="/login" class="text-blue-500 hover:text-blue-400 font-semibold transition-colors">Iniciar sesión</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '@/Utils/api';

const form = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errors = ref({});
const registerError = ref('');

const handleRegister = async () => {
    errors.value = {};
    registerError.value = '';

    if (!form.value.name) {
        errors.value.name = 'El nombre es requerido';
    }
    if (!form.value.email) {
        errors.value.email = 'El correo es requerido';
    }
    if (!form.value.password) {
        errors.value.password = 'La contraseña es requerida';
    }
    if (form.value.password.length < 8) {
        errors.value.password = 'Mínimo 8 caracteres';
    }
    if (form.value.password !== form.value.password_confirmation) {
        errors.value.password_confirmation = 'Las contraseñas no coinciden';
    }
    if (!form.value.terms) {
        registerError.value = 'Debes aceptar los términos y condiciones';
    }

    if (Object.keys(errors.value).length > 0 || !form.value.terms) return;

    loading.value = true;
    try {
        await api.post('/register', {
            name: form.value.name,
            email: form.value.email,
            password: form.value.password,
            password_confirmation: form.value.password_confirmation,
        });

        alert('Cuenta creada exitosamente. Inicia sesión.');
        window.location.href = '/login';
    } catch (error) {
        registerError.value = error.response?.data?.message || 'Error al registrarse';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgb(51, 65, 85);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgb(71, 85, 105);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
