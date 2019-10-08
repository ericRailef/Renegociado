import { NativeDateAdapter } from '@angular/material';
import { Injectable } from '@angular/core';

/**
 * Implementacion custom de NativeDateAdapter para configurar el calendario.
 */
@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  private readonly LUNES = 1;

  /**
   * Se configura para que el calendario inicie la semana desde el dia Lunes.
   */
  getFirstDayOfWeek(): number {
    return this.LUNES;
  }
}
