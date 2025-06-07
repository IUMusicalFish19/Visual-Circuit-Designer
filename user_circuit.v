module user_circuit(input A, input B, input C, output OUT1, output OUT2);
initial begin
  $dumpfile("dump.vcd");       // Имя файла для записи
  $dumpvars(0, user_circuit);  // Имя верхнего модуля
end
  assign OUT1 = A & B & C;
  assign OUT2 = A & B | C;
endmodule