import React, { useRef } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// --- 1. IMPORTAR LA IMAGEN DEL LOGO ---
import logoGenezis from '../../../assets/images/logogenezis.png';
import './OrderDetailModal.scss';

const OrderDetailModal = ({ order, isLoading, onClose }) => {
  const invoiceRef = useRef(null);

  const handleDownloadPdf = () => {
    const input = invoiceRef.current;
    if (!input) return;

    const downloadBtn = input.querySelector('.download-btn-wrapper');
    if (downloadBtn) downloadBtn.style.display = 'none';

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); 
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`orden_${order.id}.pdf`);
      
      if (downloadBtn) downloadBtn.style.display = 'block';
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading || !order.items) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Detalle de la Orden</h2>
            <button onClick={onClose} className="close-btn"><FiX /></button>
          </div>
          <div className="modal-body"><p>Cargando detalles de la orden...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalle de la Orden #{order.id}</h2>
          <button onClick={onClose} className="close-btn"><FiX /></button>
        </div>
        
        <div className="modal-body">
          <div className="invoice-container" ref={invoiceRef}>
            <div className="invoice-header">
              <div>
                <h1>Orden #{order.id}</h1>
                <p className="invoice-date">Fecha: {formatDate(order.createdat)}</p>
              </div>
              <div className="download-btn-wrapper">
                <button className="download-btn" onClick={handleDownloadPdf}>
                  <FiDownload /> Descargar PDF
                </button>
              </div>
            </div>

            <div className="customer-details">
              <p><strong>Cliente:</strong> {order.firstname} {order.lastname}</p>
              <p><strong>Email:</strong> {order.email}</p>
            </div>

            <div className="payment-details">
              <p><strong>Estado:</strong> <span className="status-text">{order.status}</span></p>
              <p><strong>ID de Pago:</strong> {order.paymentgatewayid || 'N/A'}</p>
            </div>
            
            <h3 className="items-title">Productos Comprados</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={item.productid || index}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.priceatpurchase).toFixed(2)}</td>
                    <td>${(item.quantity * parseFloat(item.priceatpurchase)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">Total Pagado:</td>
                  <td className="total-amount">${parseFloat(order.totalamount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            {/* --- 2. MODIFICAR EL FOOTER DE LA FACTURA --- */}
            <div className="invoice-footer">
              <p>Gracias por su compra en GamerStore - Genezis.</p>
              <img src={logoGenezis} alt="Logo Genezis" className="invoice-logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;