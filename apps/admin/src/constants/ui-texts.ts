export const UI_TEXTS = {
  settings: {
    title: 'Settings',
    restaurantInfoTab: 'Restaurant Info',
    settingsTab: 'Settings',
    restaurantInfo: {
      title: 'Restaurant Info',
      editButton: 'Edit',
      nameLabel: 'Name',
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      saveButton: 'Save Restaurant Info',
    },
    restaurantSettings: {
      title: 'Restaurant Settings',
      editButton: 'Edit',
      openingTimeLabel: 'Opening Time',
      closingTimeLabel: 'Closing Time',
      minAdvanceTimeLabel: 'Minimum Advance Time (Hours)',
      maxAdvanceDaysLabel: 'Maximum Advance Days',
      businessDaysLabel: 'Business Days',
      specialDaysLabel: 'Special Open Days (Override Closed days)',
      addSpecialDayButton: 'Add Open Day',
      removeSpecialDayButton: 'Remove',
      holidaysLabel: 'Special Holidays (Closed Dates)',
      addHolidayButton: 'Add Holiday',
      removeHolidayButton: 'Remove',
      deliveryHoursLabel: '配達可能時間 (Delivery Hours)',
      deliveryStartLabel: '配達可能時間 (開始)',
      deliveryEndLabel: '配達可能時間 (終了)',
      saveButton: 'Save Restaurant Settings',
    },
    orderingEnabled: {
      label: 'Ordering Enabled',
      enableButton: 'Enable Ordering (Currently Offline)',
      disableButton: 'Disable Ordering (Currently Online)',
    },
    confirmDialogs: {
      saveRestaurantInfo: {
        title: 'Save Restaurant Info',
        message: 'Are you sure you want to save the restaurant info?',
      },
      saveRestaurantSettings: {
        title: 'Save Restaurant Settings',
        message: 'Are you sure you want to save the restaurant settings?',
      },
      changeOrderingStatus: {
        title: 'Change Ordering Status',
        enableMessage: 'Are you sure you want to enable ordering?',
        disableMessage: 'Are you sure you want to disable ordering?',
      },
    },
  },
  userManagement: {
    title: 'User Management',
    description: 'Manage users and roles here.',
    tableHeaders: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
      actions: 'Actions',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      addNewUser: 'Add New User',
    },
    modals: {
      editUser: {
        title: 'Edit User',
        fields: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
        },
        buttons: {
          cancel: 'Cancel',
          save: 'Save',
        },
      },
      deleteUser: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this user?',
      },
    },
  },
  menuManagement: {
    title: 'Menu Management',
    description: "Manage your restaurant's menu items here.",
    tabs: {
      items: 'Menu Items',
      customizations: 'Customizations',
    },
    noImage: 'No Image',
    customizations: {
      masterListTitle: 'Customizations Master List',
      noGroups: 'No customization groups found.',
    },
    tableHeaders: {
      image: 'Image',
      name: 'Name',
      price: 'Price',
      description: 'Description',
      outOfStock: 'Out of Stock',
      actions: 'Actions',
    },
    itemStatus: {
      outOfStock: 'Out of Stock',
      available: 'Available',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      addNewItem: 'Add New Item',
      addNewGroup: 'Add New Customization Group',
    },
    modals: {
      editItem: {
        title: 'Edit Item',
      },
      addItem: {
        title: 'Add Item',
      },
      addGroup: {
        title: 'Add Customization Group',
      },
      form: {
        nameLabel: 'Name',
        groupNameLabel: 'Group Name',
        groupNamePlaceholder: 'e.g. Drink Size',
        priceLabel: 'Price',
        categoryLabel: 'Category',
        addNewCategory: 'Add New Category',
        newCategoryPlaceholder: 'Enter new category',
        addCategoryButton: 'Add Category',
        descriptionLabel: 'Description',
        imageUrlLabel: 'Image URL',
        outOfStockLabel: 'Out of Stock',
        cancelButton: 'Cancel',
        saveButton: 'Save',
        addOption: '+ Add Option',
        optionsLabel: 'Options',
        noCustomizationsFound: 'No customizations found.',
      },
      confirmDialogs: {
        save: {
          title: 'Confirm Save',
          message: 'Are you sure you want to save changes?',
        },
        delete: {
          title: 'Confirm Delete',
          message: 'Are you sure you want to delete this item?',
        },
        deleteGroup: {
          title: 'Delete Customization Group',
          message: 'Are you sure you want to delete this group and all its options?',
        },
        unsavedChanges: {
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Are you sure you want to close?',
        },
      },
    },
  },
  orders: {
    title: 'Orders',
    tabs: {
      kitchenPrep: 'Kitchen Prep (Batch)',
      deliveryList: 'Delivery List (Daily)',
      singleOrders: 'Single Orders',
    },
    deliveryList: {
      title: 'Delivery List of',
      headers: {
        time: 'Time',
        customer: 'Customer',
        company: 'Company',
        address: 'Address',
        postalCode: 'Postal Code',
        phone: 'Phone',
        items: 'Items',
        total: 'Total',
        notes: 'Notes',
        status: 'Status',
      },
      filters: {
        searchPlaceholder: 'Search ID or Company...',
        postalCodeLabel: 'Postal Code:',
      },
      batchActions: {
        markDelivering: 'Mark All as Delivering',
        markCompleted: 'Mark All as Completed',
      },
    },
    kitchenPrep: {
      title: 'Items for the Day',
      headers: {
        item: 'Item',
        customs: 'Customizations',
        qty: 'Qty',
        comments: 'Comments',
      },
    },
    hideDeliveredLabel: 'Hide Delivered',
    hideNonTodayLabel: 'Hide Non-Today',
    hideDeliveringLabel: 'Hide Delivering',
    hideDeliveredAndDeliveringLabel: 'Hide Delivered and Delivering', // Added hideDeliveredAndDeliveringLabel
    filterLabel: 'Filter by Date',
    kanban: {
      orderDetails: {
        trackingId: 'Tracking ID',
        customerName: 'Customer Name',
        scheduledAt: 'Scheduled At',
        total: 'Total',
      },
      buttons: {
        prevStatus: 'Previous Status',
        nextStatus: 'Next Status',
        print: 'Print',
      },
    },
    modal: {
      title: 'Order Details',
      customerInfo: {
        title: 'Customer Information',
        name: 'Name',
        phone: 'Phone',
      },
      orderInfo: {
        orderId: 'Order ID',
        scheduledAt: 'Scheduled At',
      },
      items: {
        title: 'Items',
        headers: {
          index: '#',
          item: 'Item',
          quantity: 'Quantity',
          price: 'Price',
        },
        total: 'Total',
      },
      comments: {
        title: 'Comments',
      },
    },
  },
  account: {
    title: 'Account',
    userInfo: {
      name: 'Name',
      email: 'Email',
      role: 'Role',
    },
    logoutButton: 'Logout',
    updateButton: 'Update',
    cancelButton: 'Cancel',
    editingText: 'Edit',
    updateSuccessMessage: 'User information updated successfully!',
    confirmEditTitle: 'Confirm Edit',
    confirmEditMessage: 'Are you sure you want to save changes to your account information?',
    confirmUpdateTitle: 'Confirm Update',
    confirmUpdateMessage: 'Are you sure you want to update your account information?',
  },
  orderSummary: {
    title: 'Order Summary',
    quickFilterLabel: 'Quick Filter',
    filterLabel: 'Filter by Date Range',
    groupByLabel: 'Group By',
    headers: {
      date: 'Date',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
    },
    groupByOptions: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
    quickFilters: {
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      all: 'All',
    },
  },
  currency: {
    yen: '円',
  },
};
