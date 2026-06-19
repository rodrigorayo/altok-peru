import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Testimonial {
  name: string;
  stars: number;
  text: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'altok-peru';

  // Toggles and Options
  isPersonas = signal(true);
  isMobileMenuOpen = signal(false);
  isPromociones = signal(false);
  isAyuda = signal(false);
  isContacto = signal(false);
  isLogin = signal(false);
  isRegister = signal(false);
  tipoCambio = signal<'USD_TO_PEN' | 'PEN_TO_USD'>('USD_TO_PEN'); // USD_TO_PEN: Envia USD, Recibe PEN

  // Form signals for Login
  loginEmail = signal('');
  loginPassword = signal('');
  loginRememberMe = signal(false);
  showLoginPassword = signal(false);

  // Form signals for Register
  registerName = signal('');
  registerEmail = signal('');
  registerPassword = signal('');
  registerTerms = signal(false);
  showRegisterPassword = signal(false);

  // Auth helper states
  authLoading = signal(false);
  authSuccess = signal(false);
  authErrorMessage = signal('');

  // Password strength checker for register
  passwordStrength = computed(() => {
    const p = this.registerPassword();
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0 to 4
  });

  // Action methods
  showLogin() {
    this.isLogin.set(true);
    this.isRegister.set(false);
    this.isMobileMenuOpen.set(false);
    this.authErrorMessage.set('');
    this.authSuccess.set(false);
  }

  showRegister() {
    this.isRegister.set(true);
    this.isLogin.set(false);
    this.isMobileMenuOpen.set(false);
    this.authErrorMessage.set('');
    this.authSuccess.set(false);
  }

  closeAuth() {
    this.isLogin.set(false);
    this.isRegister.set(false);
    this.authErrorMessage.set('');
    this.authSuccess.set(false);
  }

  // Simulated handlers
  handleLogin(event: Event) {
    event.preventDefault();
    if (!this.loginEmail() || !this.loginPassword()) {
      this.authErrorMessage.set('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    this.authLoading.set(true);
    this.authErrorMessage.set('');
    
    setTimeout(() => {
      this.authLoading.set(false);
      this.authSuccess.set(true);
      setTimeout(() => {
        this.closeAuth();
        this.loginEmail.set('');
        this.loginPassword.set('');
      }, 1200);
    }, 1200);
  }

  handleRegister(event: Event) {
    event.preventDefault();
    if (!this.registerName() || !this.registerEmail() || !this.registerPassword()) {
      this.authErrorMessage.set('Por favor, completa todos los campos.');
      return;
    }
    if (!this.registerTerms()) {
      this.authErrorMessage.set('Debes aceptar los Términos y Condiciones.');
      return;
    }
    this.authLoading.set(true);
    this.authErrorMessage.set('');

    setTimeout(() => {
      this.authLoading.set(false);
      this.authSuccess.set(true);
      setTimeout(() => {
        this.closeAuth();
        this.registerName.set('');
        this.registerEmail.set('');
        this.registerPassword.set('');
        this.registerTerms.set(false);
      }, 1200);
    }, 1200);
  }

  // Rates
  compraRate = signal(3.402);
  ventaRate = signal(3.428);

  // Bank rates for comparison (to calculate savings)
  bancoCompraRate = signal(3.351);
  bancoVentaRate = signal(3.485);

  // Input amounts
  montoEnviar = signal<number>(1500);

  // Monto Recibir computed dynamically
  montoRecibir = computed(() => {
    const enviar = this.montoEnviar();
    if (this.tipoCambio() === 'USD_TO_PEN') {
      return Math.round(enviar * this.compraRate() * 100) / 100;
    } else {
      return Math.round((enviar / this.ventaRate()) * 100) / 100;
    }
  });

  // Handle reciprocal updates (if user edits Recibir field)
  updateMontoRecibir(val: number) {
    if (this.tipoCambio() === 'USD_TO_PEN') {
      this.montoEnviar.set(Math.round((val / this.compraRate()) * 100) / 100);
    } else {
      this.montoEnviar.set(Math.round(val * this.ventaRate() * 100) / 100);
    }
  }

  // Savings calculation
  ahorroEstimado = computed(() => {
    const enviar = this.montoEnviar();
    if (this.tipoCambio() === 'USD_TO_PEN') {
      const recibidosKambista = enviar * this.compraRate();
      const recibidosBanco = enviar * this.bancoCompraRate();
      return Math.max(0, Math.round((recibidosKambista - recibidosBanco) * 100) / 100);
    } else {
      const recibidoUSD = enviar / this.ventaRate();
      const costoKambista = enviar;
      const costoBanco = recibidoUSD * this.bancoVentaRate();
      return Math.max(0, Math.round((costoBanco - costoKambista) * 100) / 100);
    }
  });

  // Koinks: reward points (simulated)
  koinks = computed(() => {
    if (this.tipoCambio() === 'USD_TO_PEN') {
      return Math.round(this.montoEnviar());
    } else {
      return Math.round(this.montoRecibir());
    }
  });

  // Swap currencies
  swapCurrencies() {
    const currentRecibir = this.montoRecibir();
    if (this.tipoCambio() === 'USD_TO_PEN') {
      this.tipoCambio.set('PEN_TO_USD');
    } else {
      this.tipoCambio.set('USD_TO_PEN');
    }
    // Set the previous "recibir" amount as the new "enviar" amount
    this.montoEnviar.set(Math.round(currentRecibir));
  }

  // File upload simulation
  uploadedFileName = signal<string | null>(null);
  
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFileName.set(input.files[0].name);
    }
  }

  // Testimonials Carousel
  activeTestimonialIndex = signal(0);
  testimonials: Testimonial[] = [
    {
      name: 'Nicole Rodriguez',
      stars: 5,
      text: 'Es buenísimo. Probé la plataforma hace 1 mes y realmente super la experiencia. Mejor tasa que en la calle y mil veces más seguro.'
    },
    {
      name: 'Milagros Lujan',
      stars: 5,
      text: 'Lo que más me ha gustado desde que uso Kambista es que un día deposité a la cuenta incorrecta para una operación y me enviaron un mensaje alertándome de ello. Me devolvieron el dinero en menos de una hora, no leí el mensaje y me llamaron. Este tipo de atención no la pierdan, por favor. Humaniza y personaliza el servicio. ¡Gracias!'
    },
    {
      name: 'Jean Paul',
      stars: 5,
      text: 'Excelente servicio corporativo. Las tasas son competitivas y las transferencias demoran menos de 15 minutos en horario de oficina. Recomendado para empresas.'
    }
  ];

  nextTestimonial() {
    const nextIdx = (this.activeTestimonialIndex() + 1) % this.testimonials.length;
    this.activeTestimonialIndex.set(nextIdx);
  }

  prevTestimonial() {
    const prevIdx = (this.activeTestimonialIndex() - 1 + this.testimonials.length) % this.testimonials.length;
    this.activeTestimonialIndex.set(prevIdx);
  }

  // Trend Chart Month Selection
  selectedMonth = signal<'junio' | 'mayo' | 'abril' | 'marzo'>('junio');
  
  selectMonth(month: 'junio' | 'mayo' | 'abril' | 'marzo') {
    this.selectedMonth.set(month);
    if (month === 'junio') {
      this.compraRate.set(3.402);
      this.ventaRate.set(3.428);
    } else if (month === 'mayo') {
      this.compraRate.set(3.415);
      this.ventaRate.set(3.441);
    } else if (month === 'abril') {
      this.compraRate.set(3.389);
      this.ventaRate.set(3.412);
    } else if (month === 'marzo') {
      this.compraRate.set(3.431);
      this.ventaRate.set(3.457);
    }
  }

  // Trend Chart points based on selected month (for visual authenticity)
  chartData = computed(() => {
    const m = this.selectedMonth();
    if (m === 'junio') {
      return {
        compra: 'M 10,80 Q 75,40 150,90 T 290,110 T 430,70 T 570,80 T 710,50 T 850,75',
        venta: 'M 10,60 Q 75,20 150,70 T 290,90 T 430,50 T 570,60 T 710,30 T 850,55'
      };
    } else if (m === 'mayo') {
      return {
        compra: 'M 10,90 Q 75,60 150,70 T 290,100 T 430,80 T 570,90 T 710,40 T 850,65',
        venta: 'M 10,70 Q 75,40 150,50 T 290,80 T 430,60 T 570,70 T 710,20 T 850,45'
      };
    } else if (m === 'abril') {
      return {
        compra: 'M 10,110 Q 75,90 150,110 T 290,80 T 430,90 T 570,70 T 710,80 T 850,50',
        venta: 'M 10,90 Q 75,70 150,90 T 290,60 T 430,70 T 570,50 T 710,60 T 850,30'
      };
    } else {
      return {
        compra: 'M 10,70 Q 75,30 150,60 T 290,80 T 430,40 T 570,50 T 710,20 T 850,40',
        venta: 'M 10,50 Q 75,10 150,40 T 290,60 T 430,20 T 570,30 T 710,10 T 850,20'
      };
    }
  });

  // --- EMPRESAS (COMPANIES) STATES & METHODS ---
  activePromoCouponIndex = signal(1); // Default is the middle one (20 PIPS)
  
  // FAQ accordion open/close signals for Companies
  faqOpen = signal<boolean[]>([true, false, false, false, false]);

  toggleFaq(index: number) {
    const current = [...this.faqOpen()];
    current[index] = !current[index];
    this.faqOpen.set(current);
  }

  // FAQ accordion dictionary for Help Page (Ayuda)
  faqAyudaOpen = signal<{ [key: string]: boolean }>({});

  toggleAyudaFaq(id: string) {
    const current = { ...this.faqAyudaOpen() };
    current[id] = !current[id];
    this.faqAyudaOpen.set(current);
  }

  // Corporate Testimonials (AGC, Factor Tech, Zinsac)
  activeCompanyTestimonialIndex = signal(0);
  companyTestimonials = [
    {
      company: 'AGC',
      logoText: 'AGC',
      text: 'Son súper confiables y rápidos para hacer los cambios con los bancos que necesito.',
      author: 'Hugo Gomero'
    },
    {
      company: 'FACTOR TECH',
      logoText: 'FACTOR TECH',
      text: 'Su servicio es muy bueno y rápido. Ofrece a los usuarios una experiencia confiable y conveniente.',
      author: 'Felipe Díaz'
    },
    {
      company: 'ZINSAC',
      logoText: 'ZINSAC',
      text: 'La plataforma es sencilla de usar y entender. Es una marca que transmite confianza.',
      author: 'Alfonso'
    }
  ];

  nextCompanyTestimonial() {
    const nextIdx = (this.activeCompanyTestimonialIndex() + 1) % this.companyTestimonials.length;
    this.activeCompanyTestimonialIndex.set(nextIdx);
  }

  prevCompanyTestimonial() {
    const prevIdx = (this.activeCompanyTestimonialIndex() - 1 + this.companyTestimonials.length) % this.companyTestimonials.length;
    this.activeCompanyTestimonialIndex.set(prevIdx);
  }

  selectCompanyTestimonial(index: number) {
    this.activeCompanyTestimonialIndex.set(index);
  }
}
