// #include <avr/io8535.h>
// #include <avr/iom328p.h>

void setupHardWare();
int readButton(int index);
void writeSignals(int op, int clock_gate, int clock_spin);

#if defined(__AVR_ATmega328P__)
int pin_out0 = 10;
int pin_out1 = 11;
int pin_out2 = 12;

int in0_pin = 3;
int in1_pin = 4;
int in1_gnd_pin = 6;
int in2_pin = 7;
int in2_gnd_pin = 9;

void setupHardWare()
{
  pinMode(pin_out0, OUTPUT);
  pinMode(pin_out1, OUTPUT);
  pinMode(pin_out2, OUTPUT);

  pinMode(in0_pin, INPUT_PULLUP);
  pinMode(in1_pin, INPUT_PULLUP);
  pinMode(in1_gnd_pin, OUTPUT);
  digitalWrite(in1_gnd_pin, LOW);
  pinMode(in2_pin, INPUT_PULLUP);
  pinMode(in2_gnd_pin, OUTPUT);
  digitalWrite(in2_gnd_pin, LOW);

  TCCR1A = 0;          // Init Timer1A
  TCCR1B = 0;          // Init Timer1B
  TCCR1B |= B00000101; // Clk (1024 prescaler)
  TCNT1 = 0;
}

int readButton(int index)
{
  if (index == 0)
  {
    return !digitalRead(in0_pin);
  }
  if (index == 1)
  {
    return !digitalRead(in1_pin);
  }
  if (index == 2)
  {
    return !digitalRead(in2_pin);
  }
}

void writeSignals(int op, int clock_gate, int clock_spin)
{
  PORTB = (op ? (1 << 2) : 0) |
          (clock_gate ? (1 << 3) : 0) |
          (clock_spin ? (1 << 4) : 0);
}
#endif

#if defined(__AVR_ATtiny85__)
int pin_out0 = 2;
int pin_out1 = 1;
int pin_out2 = 0;

int in0_pin = 5;
int in1_pin = 3;
int in2_pin = 4;

void setupHardWare()
{
  pinMode(pin_out0, OUTPUT);
  pinMode(pin_out1, OUTPUT);
  pinMode(pin_out2, OUTPUT);

  pinMode(A0, INPUT);
  pinMode(in1_pin, INPUT_PULLUP);
  pinMode(in2_pin, INPUT_PULLUP);

  noInterrupts();
  TCCR1 = 0; // Init Timer1
             //  TCCR1 |= B00001111;  // Clk (16384 prescaler)
  // TCCR1 |= B00001011;  // Clk (1024 prescaler)
  TCCR1 |= B00001010; // Clk (512 prescaler)
  TCNT1 = 0;

  CLKPR = 0x80; // enable clock prescale change
  CLKPR = 0;    // no prescale
  interrupts();
}

int readButton(int index)
{
  if (index == 0)
  {
    return analogRead(A0) < 930;
  }
  if (index == 1)
  {
    return !digitalRead(in1_pin);
  }
  if (index == 2)
  {
    return !digitalRead(in2_pin);
  }
}

void writeSignals(int op, int clock_gate, int clock_spin)
{
  PORTB = (PORTB & 0b11111000) |
          (op ? (1 << 2) : 0) |
          (clock_gate ? (1 << 1) : 0) |
          (clock_spin ? (1 << 0) : 0);
}
#endif

void setup()
{
  setupHardWare();
}

#define BUTTON_DEBOUNCE_PERIOD 30
#define BUTTON_RELEASE_PERIOD 150
#define BUTTON_MAX_PERIOD 1000

struct ButtonState
{
  byte state;
  byte count;
  short period;
};

struct ButtonState buttonState[3];

void signalButton(struct ButtonState *button, byte state)
{
  if (button->state == state || button->period < BUTTON_DEBOUNCE_PERIOD)
  {
    if (button->period < BUTTON_MAX_PERIOD)
    {
      button->period++;
    }
  }
  else
  {
    if (state)
    {
      button->count++;
    }
    button->state = state;
    button->period = 0;
  }
}

void updateButtons(void)
{
  for (int i = 0; i < 3; i++)
  {
    signalButton(&buttonState[i], readButton(i));
  }
}

int clickButton(int index)
{
  int count = 0;
  if (buttonState[index].count > 0 && buttonState[index].state == 1)
  {
    count = buttonState[index].count;
    buttonState[index].count = 0;
  }

  return count;
}

int countButton(int index)
{
  int count = 0;
  if (buttonState[index].count > 0 && buttonState[index].state == 0 && buttonState[index].period > BUTTON_RELEASE_PERIOD)
  {
    count = buttonState[index].count;
    buttonState[index].count = 0;
  }

  return count;
}

#include "program.h"

const byte **progActive = NULL;
int progIndex = 0;
int progPhase = 0;

#define PROG_DIVIDER 1
int progDivider = 0;

void loop()
{
  if (TCNT1 & 16)
  {
    TCNT1 = 0;

    updateButtons();

    if (!progActive)
    {
      // if (clickButton(1))
      // {
      //   progActive = progA;
      // }

      // if (clickButton(2))
      // {
      //   progActive = progB;
      // }

      int button = countButton(0);
      switch (button)
      {
      case 1:
        progActive = prog1;
        break;
      case 2:
        progActive = prog2;
        break;
      case 3:
        progActive = prog3;
        break;
      case 4:
        progActive = prog4;
        break;
      case 5:
        progActive = prog5;
        break;
      case 6:
        progActive = prog6;
        break;
      case 7:
        progActive = prog7;
        break;
      case 8:
        progActive = prog8;
        break;
      case 9:
        progActive = prog9;
        break;
      }

      button = countButton(1);
      switch (button)
      {
      case 1:
        progActive = progAdd;
        break;
      case 2:
        progActive = progSub;
        break;
      case 3:
        progActive = progSwap;
        break;
      }
      
      button = countButton(2);
      switch (button)
      {
      case 1:
        progActive = progGate;
        break;
      case 2:
        progActive = progSpin;
        break;
      }

      if (progActive)
      {
        progIndex = 0;
        progPhase = 0;
      }
    }
  }

  if (progActive)
  {
    if (progDivider == 0)
    {
      int length = pgm_read_byte_near(*progActive + 0) << 8 | pgm_read_byte_near(*progActive + 1);
      byte data = pgm_read_byte_near(*progActive + (progIndex >> 3) + 2);
      byte bit = (data >> (7 - (progIndex & 7))) & 1;

      if (progPhase == 0)
      {
        writeSignals(bit, 0, 0);
        progPhase = 1;
      }
      else
      {
        writeSignals(bit, 1, !bit);
        progPhase = 0;
        progIndex++;
      }

      if (progIndex == length)
      {
        progIndex = 0;
        progActive++;
        length = pgm_read_byte_near(*progActive + 0) << 8 | pgm_read_byte_near(*progActive + 1);
        if (length == 0)
        {
          progActive = NULL;
        }
      }

      progDivider = PROG_DIVIDER;
    }
    else
    {
      progDivider--;
    }
  }

  // delayMicroseconds(10);
}