// #include <avr/io8535.h>

// #include <avr/iom328p.h>

int pin_out0 = 10;
int pin_out1 = 11;
int pin_out2 = 12;

int in0_pin = 3;
int in1_pin = 4;
int in1_gnd_pin = 6;
int in2_pin = 7;
int in2_gnd_pin = 9;

void setup()
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

int spin_or_gate = 0;
int spin_button = 0;
int gate_button = 0;
int pulse_ticks = 0;

void loop()
{
  int spin_button_next = !digitalRead(in0_pin);
  int gate_button_next = !digitalRead(in1_pin);

  if (spin_button_next && spin_button_next != spin_button)
  {
    spin_or_gate = 0;
    pulse_ticks = 50;
  }

  if (gate_button_next && gate_button_next != gate_button)
  {
    spin_or_gate = 1;
    pulse_ticks = 50;
  }

  PORTB = (spin_or_gate ? (1 << 2) : 0) |
          (pulse_ticks < 25 && pulse_ticks > 0 ? (1 << 3) : 0) |
          (pulse_ticks < 25 && pulse_ticks > 0 && spin_or_gate == 0 ? (1 << 4) : 0);
  // digitalWrite(pin_out0, spin_or_gate);
  // digitalWrite(pin_out1, pulse_ticks > 0);
  // digitalWrite(pin_out2, pulse_ticks > 0 && spin_or_gate == 0);

  spin_button = spin_button_next;
  gate_button = gate_button_next;
  if (pulse_ticks > 0)
  {
    pulse_ticks--;
  }
  else
  {
    spin_or_gate = 0;
  }

  delay(1);
}