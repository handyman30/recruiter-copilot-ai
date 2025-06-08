declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (selector: string) => void;
      };
    };
  }
}

interface PayPalButtonsConfig {
  style?: {
    shape?: string;
    color?: string;
    layout?: string;
    label?: string;
  };
  createSubscription?: (data: any, actions: any) => Promise<any>;
  onApprove?: (data: any, actions: any) => void;
  onError?: (err: any) => void;
  onCancel?: (data: any) => void;
}

export {}; 