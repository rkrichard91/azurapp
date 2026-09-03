import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCart } from './useCart';

describe('useCart Hook', () => {
    const mockSignatureProducts = [
        {
            id: 'sig-natural',
            name: 'Firma P. Natural (Cédula)',
            prices: [
                { id: 'p1', price: 20, duration_label: '1 Año', renewal_price: 15 }
            ]
        },
        {
            id: 'sig-juridica',
            name: 'Firma Electrónica Representante Legal',
            prices: [
                { id: 'p2', price: 30, duration_label: '1 Año', renewal_price: 25 }
            ]
        }
    ];

    const mockSignatureOptions = [
        { product: mockSignatureProducts[0], label: 'Firma P. Natural' }
    ];

    const initialProps = {
        planProducts: [],
        signatureProducts: mockSignatureProducts,
        moduleProducts: [],
        emissionPointProduct: null,
        signatureOptions: mockSignatureOptions
    };

    it('should initialize with default idType as cedula', () => {
        const { result } = renderHook(() => useCart(initialProps));

        act(() => {
            result.current.openSignatureModal();
        });

        expect(result.current.sigForm.idType).toBe('cedula');
    });

    it('should update idType in sigForm', () => {
        const { result } = renderHook(() => useCart(initialProps));

        act(() => {
            result.current.openSignatureModal();
        });

        act(() => {
            result.current.setSigForm(prev => ({ ...prev, idType: 'ruc' }));
        });

        expect(result.current.sigForm.idType).toBe('ruc');
    });

    it('should add signature with correct idType suffix in name (RUC)', () => {
        const { result } = renderHook(() => useCart(initialProps));

        // Open modal
        act(() => {
            result.current.openSignatureModal();
        });

        // Select RUC
        act(() => {
            result.current.setSigForm(prev => ({
                ...prev,
                productId: 'sig-natural',
                priceId: 'p1',
                idType: 'ruc'
            }));
        });

        // Confirm
        act(() => {
            result.current.confirmAddSignature();
        });

        const item = result.current.cartItems.find(i => i.type === 'SIGNATURE');
        expect(item).toBeDefined();
        // Should have (RUC)
        expect(item.name).toContain('(RUC)');
        // Should NOT have (Cédula) - stripped from base name
        expect(item.name).not.toContain('(Cédula)');
    });

    it('should add signature WITHOUT suffix when idType is cedula', () => {
        const { result } = renderHook(() => useCart(initialProps));

        // Open modal
        act(() => {
            result.current.openSignatureModal();
        });

        // Select Cedula (default)
        act(() => {
            result.current.setSigForm(prev => ({
                ...prev,
                productId: 'sig-natural',
                priceId: 'p1',
                idType: 'cedula'
            }));
        });

        // Confirm
        act(() => {
            result.current.confirmAddSignature();
        });

        const item = result.current.cartItems.find(i => i.type === 'SIGNATURE');
        expect(item).toBeDefined();
        // Should NOT have (Cédula) - stripped
        expect(item.name).not.toContain('(Cédula)');
        // Should NOT have (RUC)
        expect(item.name).not.toContain('(RUC)');
        // Should match cleaned name
        expect(item.name).toBe('Firma P. Natural - Gestión Vendedor');
    });

    it('should NOT add suffix for non-natural signature', () => {
        const { result } = renderHook(() => useCart(initialProps));

        act(() => {
            result.current.openSignatureModal();
        });

        act(() => {
            result.current.setSigForm(prev => ({
                ...prev,
                productId: 'sig-juridica',
                priceId: 'p2',
                idType: 'ruc' // Even if set, logic should ignore for this name
            }));
        });

        act(() => {
            result.current.confirmAddSignature();
        });

        const item = result.current.cartItems.find(i => i.type === 'SIGNATURE');
        expect(item.name).not.toContain('(RUC)');
        expect(item.name).not.toContain('(Cédula)');
    });

    it('should include VAT disclaimer in copy text per line item', () => {
        const { result } = renderHook(() => useCart(initialProps));

        // Mock clipboard
        const writeTextMock = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock
            }
        });

        // Mock alert
        global.alert = vi.fn();

        // Add an item to test the copy
        act(() => {
            result.current.openSignatureModal();
        });
        act(() => {
            result.current.setSigForm(prev => ({
                ...prev,
                productId: 'sig-natural',
                priceId: 'p1',
                idType: 'cedula'
            }));
        });
        act(() => {
            result.current.confirmAddSignature();
        });


        act(() => {
            result.current.handleCopy('DETALLE');
        });

        expect(writeTextMock).toHaveBeenCalled();
        const copiedText = writeTextMock.mock.calls[0][0];
        // Check for specific format on the line item and totals
        expect(copiedText).toContain('Azur\nSerían los siguientes servicios:\n');
        expect(copiedText).toContain('Firma P. Natural - 1 Año - $20+iva');
        expect(copiedText).toContain('Total $20+iva');
        expect(copiedText).toContain('Valor final $23.00');
    });

    it('should support adding multiple plans to cart and calculating totals', () => {
        const mockPlanProducts = [
            {
                id: 'plan-1',
                name: 'Plan Pyme Ilimitado',
                prices: [{ id: 'p-1', price: 100, duration_label: '1 Año' }]
            },
            {
                id: 'plan-2',
                name: 'Plan Pro Ilimitado',
                prices: [{ id: 'p-2', price: 200, duration_label: '1 Año' }]
            }
        ];

        const { result } = renderHook(() => useCart({
            ...initialProps,
            planProducts: mockPlanProducts
        }));

        act(() => {
            result.current.openPlanModal();
        });

        act(() => {
            result.current.setPlanForm({
                productId: 'plan-1',
                priceId: 'p-1',
                months: 1,
                discount: 10 // 10% de descuento -> 90
            });
        });

        act(() => {
            result.current.confirmAddPlan();
        });

        act(() => {
            result.current.openPlanModal();
        });

        act(() => {
            result.current.setPlanForm({
                productId: 'plan-2',
                priceId: 'p-2',
                months: 1,
                discount: 0 // 200
            });
        });

        act(() => {
            result.current.confirmAddPlan();
        });

        const planItems = result.current.cartItems.filter(i => i.type === 'PLAN');
        expect(planItems.length).toBe(2);
        expect(planItems[0].total).toBe(90);
        expect(planItems[1].total).toBe(200);
        expect(result.current.subtotal).toBe(290);
    });

    it('should remove specific plan when handleRemoveItem is called', () => {
        const mockPlanProducts = [
            {
                id: 'plan-1',
                name: 'Plan Pyme Ilimitado',
                prices: [{ id: 'p-1', price: 100, duration_label: '1 Año' }]
            }
        ];

        const { result } = renderHook(() => useCart({
            ...initialProps,
            planProducts: mockPlanProducts
        }));

        act(() => {
            result.current.openPlanModal();
        });
        act(() => {
            result.current.setPlanForm({ productId: 'plan-1', priceId: 'p-1', months: 1, discount: 0 });
        });
        act(() => {
            result.current.confirmAddPlan();
        });

        expect(result.current.cartItems.filter(i => i.type === 'PLAN').length).toBe(1);

        const item = result.current.cartItems.find(i => i.type === 'PLAN');
        act(() => {
            result.current.handleRemoveItem(item);
        });

        expect(result.current.cartItems.filter(i => i.type === 'PLAN').length).toBe(0);
    });

    it('should support adding a plan with quantity > 1', () => {
        const mockPlanProducts = [
            {
                id: 'plan-1',
                name: 'Plan Pyme Ilimitado',
                prices: [{ id: 'p-1', price: 100, duration_label: '1 Año' }]
            }
        ];

        const { result } = renderHook(() => useCart({
            ...initialProps,
            planProducts: mockPlanProducts
        }));

        act(() => {
            result.current.openPlanModal();
        });
        act(() => {
            result.current.setPlanForm({ productId: 'plan-1', priceId: 'p-1', months: 1, quantity: 3, discount: 10 });
        });
        act(() => {
            result.current.confirmAddPlan();
        });

        const item = result.current.cartItems.find(i => i.type === 'PLAN');
        expect(item).toBeDefined();
        expect(item.quantity).toBe(3);
        expect(item.unitPrice).toBe(90); // 100 * 0.90
        expect(item.total).toBe(270); // 90 * 3
        expect(result.current.subtotal).toBe(270);
    });

    it('should calculate Medical Module correctly for 1 doctor, 3 doctors, 10 doctors and 20 doctors', () => {
        const mockModuleProducts = [
            {
                id: 'mod-medico',
                name: 'Módulo Médico',
                prices: [{ id: 'p-med', price: 150, duration_label: '1 AÑO' }]
            },
            {
                id: 'mod-cobranzas',
                name: 'Módulo de Cobranzas',
                prices: [{ id: 'p-cob', price: 80, duration_label: '1 AÑO' }]
            },
            {
                id: 'mod-comercial',
                name: 'Módulo de Gestión Comercial',
                prices: [{ id: 'p-com', price: 100, duration_label: '1 AÑO' }]
            }
        ];

        const { result } = renderHook(() => useCart({
            ...initialProps,
            moduleProducts: mockModuleProducts
        }));

        // 1. Caso 1 doctor: $150 c/u -> $150
        act(() => {
            result.current.setSelectedModules([
                { productId: 'mod-medico', priceId: 'p-med', quantity: 1, months: 1, discount: 0 }
            ]);
        });
        let medItem = result.current.cartItems.find(i => i.name === 'Módulo Médico');
        expect(medItem.total).toBe(150);
        expect(medItem.details).toContain('1 doctor a $150.00 c/u');

        // 2. Caso 3 doctores (rango 2 a 5): $80 c/u -> 3 * 80 = 240
        act(() => {
            result.current.setSelectedModules([
                { productId: 'mod-medico', priceId: 'p-med', quantity: 3, months: 1, discount: 0 }
            ]);
        });
        medItem = result.current.cartItems.find(i => i.name === 'Módulo Médico');
        expect(medItem.total).toBe(240);
        expect(medItem.details).toContain('3 doctores a $80.00 c/u');

        // 3. Caso 10 doctores (rango 6 a 15): $51 c/u -> 10 * 51 = 510
        act(() => {
            result.current.setSelectedModules([
                { productId: 'mod-medico', priceId: 'p-med', quantity: 10, months: 1, discount: 0 }
            ]);
        });
        medItem = result.current.cartItems.find(i => i.name === 'Módulo Médico');
        expect(medItem.total).toBe(510);
        expect(medItem.details).toContain('10 doctores a $51.00 c/u');

        // 4. Caso 20 doctores (rango 16 en adelante): $40 c/u -> 20 * 40 = 800
        act(() => {
            result.current.setSelectedModules([
                { productId: 'mod-medico', priceId: 'p-med', quantity: 20, months: 1, discount: 0 }
            ]);
        });
        medItem = result.current.cartItems.find(i => i.name === 'Módulo Médico');
        expect(medItem.total).toBe(800);
        expect(medItem.details).toContain('20 doctores a $40.00 c/u');

        // 5. Cobranzas ($80) y Gestión Comercial ($100)
        act(() => {
            result.current.setSelectedModules([
                { productId: 'mod-cobranzas', priceId: 'p-cob', quantity: 1, months: 1, discount: 0 },
                { productId: 'mod-comercial', priceId: 'p-com', quantity: 1, months: 1, discount: 0 }
            ]);
        });
        const cobItem = result.current.cartItems.find(i => i.name === 'Módulo de Cobranzas');
        const comItem = result.current.cartItems.find(i => i.name === 'Módulo de Gestión Comercial');
        expect(cobItem.total).toBe(80);
        expect(comItem.total).toBe(100);
        expect(result.current.subtotal).toBe(180);
    });
});

