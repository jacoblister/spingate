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

void loop()
{
  digitalWrite(pin_out0, !digitalRead(in0_pin));
  digitalWrite(pin_out1, !digitalRead(in1_pin));
  digitalWrite(pin_out2, !digitalRead(in2_pin));
  digitalWrite(13, !digitalRead(in0_pin));
  delay(10);
}