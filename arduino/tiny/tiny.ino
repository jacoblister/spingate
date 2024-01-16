int pin_out0 = 2;
int pin_out1 = 1;
int pin_out2 = 0;

int in0_pin = 5;
int in1_pin = 3;
int in2_pin = 4;

void setup()
{
  pinMode(pin_out0, OUTPUT);
  pinMode(pin_out1, OUTPUT);
  pinMode(pin_out2, OUTPUT);

  pinMode(A0, INPUT);
  pinMode(in1_pin, INPUT_PULLUP);
  pinMode(in2_pin, INPUT_PULLUP);
}

int spin_or_gate = 0;
int spin_button = 0;
int gate_button = 0;
int pulse_ticks = 0;

void loop()
{
  int spin_button_next = analogRead(A0) < 930;
  int gate_button_next = !digitalRead(in1_pin);
  int test_button_next = !digitalRead(in2_pin);

  if (spin_button_next && spin_button_next != spin_button)
  {
    spin_or_gate = 0;
    pulse_ticks = 2;
  }

  if (gate_button_next && gate_button_next != gate_button)
  {
    spin_or_gate = 1;
    pulse_ticks = 2;
  }

  PORTB = (PORTB & 0b11111000) | 
          (spin_or_gate ? (1 << 2) : 0) |
          (pulse_ticks < 2 && pulse_ticks > 0 ? (1 << 1) : 0) |
          (pulse_ticks < 2 && pulse_ticks > 0 && spin_or_gate == 0 ? (1 << 0) : 0);
  // digitalWrite(pin_out0, spin_button_next);
  // digitalWrite(pin_out1, gate_button_next);
  // PORTB = (PORTB & 0b11111000) |
  //         (spin_button_next ? (1 << 2) : 0) |
  //         (gate_button_next ? (1 << 1) : 0) |
  //         (test_button_next ? (1 << 0) : 0);

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

  delay(50);
}