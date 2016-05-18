import { Kernel } from 'inversify';

var kernel = new Kernel();

export function getKernel() {
    return kernel;
}

export function refreshKernel() {
    kernel = new Kernel();
}