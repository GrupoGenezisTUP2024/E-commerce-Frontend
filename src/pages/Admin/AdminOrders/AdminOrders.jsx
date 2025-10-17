import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus, createOrder } from '../../../services/orderService';
import './AdminOrders.scss';

// --- Componente del Formulario Modal para Crear Orden ---
const CreateOrderModal = ({ onSave, onCancel }) => {
  const [orderData, setOrderData] = useState({
    userId: '',
    status: 'paid',
    totalAmount: '',
    paymentGatewayId: '',
  });
  const [items, setItems] = useState([{ productId: '', quantity: '', priceAtPurchase: '' }]);

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: '', priceAtPurchase: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalOrder = {
      ...orderData,
      totalAmount: parseFloat(orderData.totalAmount),
      userId: parseInt(orderData.userId, 10),
      items: items.map(item => ({
        productId: parseInt(item.productId, 10),
        quantity: parseInt(item.quantity, 10),
        priceAtPurchase: parseFloat(item.priceAtPurchase),
      })),
    };
    onSave(finalOrder);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h2>Crear Nueva Orden Manual</h2>
        <form onSubmit={handleSubmit}>
          {/* ... campos del formulario ... */}
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="submit">Crear Orden</button>
        </form>
      </div>
    </div>
  );
};


// --- Componente Principal de la Página ---
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getAllOrders();
        setOrders(ordersData);
      } catch (err) {
        setError('No se pudieron cargar las órdenes.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setError('Error al actualizar el estado.');
    }
  };
  
  const handleCreateOrder = async (orderData) => {
      try {
          const newOrder = await createOrder(orderData);
          setOrders(prev => [newOrder, ...prev]); // Añade la nueva orden al principio
          setIsModalOpen(false);
      } catch (err) {
          setError(err.message || 'Error al crear la orden.');
      }
  };

  if (loading) return <p>Cargando órdenes...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="admin-orders-container">
      <div className="admin-header">
        <h1>Gestión de Órdenes</h1>
        <button onClick={() => setIsModalOpen(true)}>+ Crear Orden Manual</button>
      </div>

      {isModalOpen && <CreateOrderModal onSave={handleCreateOrder} onCancel={() => setIsModalOpen(false)} />}
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID Orden</th>
              <th>ID Usuario</th>
              <th>Estado</th>
              <th>Total</th>
              <th>ID Pago</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userid}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`status-select status-${order.status}`}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagada</option>
                    <option value="shipped">Enviada</option>
                    <option value="delivered">Entregada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </td>
                <td>${parseFloat(order.totalamount).toFixed(2)}</td>
                <td>{order.paymentgatewayid}</td>
                <td>{new Date(order.createdat).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;