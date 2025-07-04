import { useEffect, useState } from 'react';
import { useCreateOrder } from '../../../hook/order/useOrderMutation';
import { useCurrentProfile } from '../../../hook/userProfile/useUserProfileQuery';
import { useCreateAddress, useUpdateAddress, useAddressesByCustomer } from '../../../hook/address/useAddress';
import { addressService } from '../../../service/AddressService';

export const useOrderForm = (navigate, location) => {
    const { state } = location;
    const { mutate: createOrder, isLoading: isOrderLoading } = useCreateOrder();
    const { data: user, isLoading: isUserLoading, error: userError } = useCurrentProfile();

    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const { data: customerAddresses } = useAddressesByCustomer(user?.id, {
        enabled: !!user?.id
    });

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [paymentMode, setPaymentMode] = useState('ONLINE');
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    const { cartItems = [], totalAmount = 0 } = state || {};

    console.log('cartitems',cartItems)

    // Set default address from customer's saved addresses
    useEffect(() => {
        if (customerAddresses?.length > 0 && !selectedAddress) {
            const defaultAddress = customerAddresses.find(addr => addr.isDefault) || customerAddresses[0];
            setSelectedAddress(defaultAddress);
        }
    }, [customerAddresses, selectedAddress]);
    const handleAddressSave = async (formData) => {
        setIsAddressLoading(true);
        try {
            let savedAddress;

            if (formMode === 'edit' && selectedAddress?.id) {
                savedAddress = await updateAddress.mutateAsync({
                    id: selectedAddress.id,
                    address: formData
                });
            } else {
                savedAddress = await createAddress.mutateAsync({
                    ...formData,
                    customerId: user.id
                });
            }

            // ✅ Use direct API call to fetch fresh list
            const updatedList = await addressService.getAddressesByCustomer(user.id);

            // ✅ Set the updated or fallback address
            const updated = updatedList.find(addr => addr.id === savedAddress.id);
            setSelectedAddress(updated || updatedList[0]);

            setShowAddressForm(false);
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setIsAddressLoading(false);
        }
    };
    
 
    

    const handleOrderSubmit = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        const orderPayload = {
            customerName: selectedAddress.name,
            contact: selectedAddress.phone,
            email: user?.email,
            totalAmount,
            address: formatAddress(selectedAddress),
            paymentMode,
            
            items: cartItems.map(item => ({
                productId: item.id,
                productName: item.name,
                price: parseFloat(item.price),
                itemId: item.itemId,
                tagNo: item.tagNo,
                sno:item.sno,
                imagePath:item.image_path,

            })),
            shippingAddressId: selectedAddress.id
        };
        console.log(orderPayload,'pay');
        localStorage.setItem('orderpay', JSON.stringify(orderPayload));
        const savedOrder = JSON.parse(localStorage.getItem('orderpay'));
        console.log(savedOrder);

        createOrder(orderPayload, {
            onSuccess: (data) => {
                if (paymentMode === 'ONLINE') {
                    navigate(`/payment/${data.orderId}`);
                } else {
                    navigate('/orders', { state: { orderSuccess: true } });
                }
            }
        });
    };

    const formatAddress = (addr) => {
        return [
            addr.addressLine,
            addr.locality,
            addr.landmark,
            `${addr.city}, ${addr.state} - ${addr.pincode}`
        ].filter(Boolean).join(', ');
    };

    return {
        user,
        address: selectedAddress,
        addresses: customerAddresses || [],
        paymentMode,
        showAddressForm,
        formMode,
        cartItems,
        totalAmount,
        isLoading: isOrderLoading || isAddressLoading,
        isUserLoading,
        userError,
        handleOrderSubmit,
        handleAddressEdit: (address) => {
            setSelectedAddress(address);
            setFormMode('edit');
            setShowAddressForm(true);
        },
        handleAddressAdd: () => {
            setFormMode('add');
            setShowAddressForm(true);
        },
        handleAddressSave,
        handleAddressCancel: () => setShowAddressForm(false),
        handlePaymentChange: (mode) => setPaymentMode(mode),
        handleAddressSelect: (address) => setSelectedAddress(address),
    };
};
