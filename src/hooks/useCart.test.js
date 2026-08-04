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
});
