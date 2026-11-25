const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
	login: (pin) => ipcRenderer.invoke('auth:login', pin),
	getSettings: () => ipcRenderer.invoke('settings:get'),
	updateSettings: (settings) => ipcRenderer.invoke('settings:update', settings),
	getProducts: () => ipcRenderer.invoke('db:getProducts'),
	addProduct: (product) => ipcRenderer.invoke('db:addProduct', product),
	updateProduct: (product) => ipcRenderer.invoke('db:updateProduct', product),
	deleteProduct: (productId) => ipcRenderer.invoke('db:deleteProduct', productId),
	getCustomers: () => ipcRenderer.invoke('db:getCustomers'),
	addCustomer: (customer) => ipcRenderer.invoke('db:addCustomer', customer),
	updateCustomer: (customer) => ipcRenderer.invoke('db:updateCustomer', customer),
	deleteCustomer: (customerId) => ipcRenderer.invoke('db:deleteCustomer', customerId),
	getCustomerLedger: (customerId) => ipcRenderer.invoke('db:getCustomerLedger', customerId),
})