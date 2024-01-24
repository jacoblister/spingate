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

byte progSpin[] = {0x00, 0x01, 0x00};
byte progGate[] = {0x00, 0x01, 0x80};
// byte progSpinBack[] = {0x00, 0x0C, 0x00};
// byte progSpinBack[] = {0x00, 0x04, 0xC0};
byte progSpinBack[] = {0x00, 0x0F, 0x18, 0x00};
byte *progActive = NULL;
int progIndex = 0;
int progPhase = 0;

#define PROG_DIVIDER 1
#define BUTTON_DIVIDER 1000
int progDivider = 0;
int buttonDivider = 0;

void loop()
{
  if (buttonDivider == 0)
  {
    updateButtons();
    buttonDivider = BUTTON_DIVIDER;

    if (!progActive)
    {
      int button = countButton(0);
      switch (button)
      {
      case 1:
        progActive = progSpin;
        break;
      case 2:
        progActive = progGate;
        break;
      }

      if (clickButton(1)) {
        progActive = progSpinBack;
      }

      if (progActive)
      {
        progIndex = 0;
        progPhase = 0;
      }
    }
  }
  buttonDivider--;

  if (progActive)
  {
    if (progDivider == 0)
    {
      int length = progActive[1];
      int bit = (progActive[(progIndex >> 3) + 2] >> (7 - (progIndex & 7))) & 1;
      if (progPhase == 0)
      {
        if (progIndex == length)
        {
          progActive = NULL;
          bit = 0;
        }
        writeSignals(bit, 0, 0);

        progPhase = 1;
      }
      else
      {
        writeSignals(bit, 1, !bit);

        progPhase = 0;
        progIndex++;
      }

      progDivider = PROG_DIVIDER;
    }
    else
    {
      progDivider--;
    }
  }

  delayMicroseconds(1);
}