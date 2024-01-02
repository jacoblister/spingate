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

void loop()
{
  digitalWrite(pin_out0, analogRead(A0) < 930);
  digitalWrite(pin_out1, !digitalRead(in1_pin));
  digitalWrite(pin_out2, !digitalRead(in2_pin));
  digitalWrite(13, !digitalRead(in0_pin));
  delay(10);
}