export class MensajesErrores {
  static readonly ERR_COMUNICACION_SRV = 'Error de comunicacion con servicio';

  static readonly ERROR_GENERICO = 'En este momento no es posible atender la consulta del servicio solicitado. Por favor inténtalo más tarde.';
  static readonly DEUDA_SUPERA_PERMITIDO = 'Estimado cliente, la oferta tiene como límite hasta 2000 UF de deuda a refinanciar. Si tienes dudas llámanos al (600) 3203000.';
  static readonly SIN_DEUDA = 'Estimado cliente, no presenta deudas al dia de hoy, no se puede continuar con la oferta.';

  static readonly MTO_SIMULADO_SUPERIOR = 'Estimado cliente, el monto simulado según nuestros registros supera el límite de UF 2000 de deuda a refinanciar. Por favor, para mas detalles comunícate al (600) 3203000.';
  static readonly COMPRAS_EN_VUELO = 'Estimado cliente, tu(s) tarjeta(s) posee(n) compras en proceso de autorización, por lo que por el momento no es posible continuar con la operación. Si tienes consultas llámanos al (600) 3203000.';

  static readonly COMPRA_DOLARES = 'Estimado cliente, por el momento no es posible realizar la compra en dólares para la Tarjeta de Crédito internacional, por favor inténtalo al día hábil siguiente.';

  static readonly SUPERCLAVE_NO_ASIGNADA = 'Estimado cliente: No posees una SuperClave asignada. Por favor acércate a la sucursal más cercana.';
  static readonly SUPERCLAVE_BLOQUEADA = 'Estimado cliente: Tu SuperClave se encuentra bloqueada. Por favor acércate a la sucursal más cercana o llama al (600) 320 3000.';
  static readonly SUPERCLAVE_INACTIVA = 'Estimado cliente: Tu SuperClave se encuentra Inactiva. Por favor acércate a la sucursal más cercana o llama al (600) 320 3000.';
  static readonly SUPERCLAVE_VAL_INVALIDOS = 'Los valores de coordenadas ingresados no son válidos. Aún te restan [intentos] intentos antes de que, por tu seguridad, se bloquee el servicio de transferencias.';
}
