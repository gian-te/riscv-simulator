# RiscvSimulator
See it live: https://riscv-simulator.azurewebsites.net/

This project is a compiler and simulator for the RISC-V RV32I Instruction Set Architecture. This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.5.

Final UI (for now):
![image](https://user-images.githubusercontent.com/22191379/119795925-801f1c00-bf0b-11eb-8108-4f133342c28b.png)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Azure PaaS Deployment

This RISC-V simulator uses Azure App Service to host the Angular web application. For more info on deploying an Angular web application to Azure PaaS, click here:
Deployment: https://www.c-sharpcorner.com/article/easily-deploy-angular-app-to-azure-from-visual-studio-code/

## Supported Instructions

LB, LH, LW, SB, SH, SW, ADD, ADDI, SLT, SLTI, BEQ, BNE, BLT, BGE

## Supported Directives

.byte, .half, .word

## Caching

The program implements Direct Mapping cache algorithm.

## Data Segment

Memory for the data segment starts from hex address 1000 to hex address 1FFF.

## Code Segment

Memory for the code segment starts from hex address 0000 to hex address 07FF

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
