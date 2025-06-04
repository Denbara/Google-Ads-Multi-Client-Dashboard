import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "./ui/use-toast";
import { Client } from "../lib/clientsService";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default"
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const useClientValidation = () => {
  // Validate client data
  const validateClient = (client: Partial<Client>): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!client.name || client.name.trim() === '') {
      errors.name = 'Client name is required';
    }
    
    if (!client.company || client.company.trim() === '') {
      errors.company = 'Company name is required';
    }
    
    if (!client.dateOnboarded) {
      errors.dateOnboarded = 'Onboarding date is required';
    }
    
    if (!client.assignedTeamMember) {
      errors.assignedTeamMember = 'Team member assignment is required';
    }
    
    // Email validation if provided
    if (client.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
    
    // Phone validation if provided (simple format check)
    if (client.contactPhone && !/^[0-9()\-\s+]+$/.test(client.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Show validation toast
  const showValidationErrors = (errors: Record<string, string>) => {
    const errorList = Object.values(errors).map(error => `• ${error}`).join('\n');
    
    toast({
      title: "Validation Error",
      description: (
        <div className="whitespace-pre-line">
          Please fix the following errors:
          {'\n'}
          {errorList}
        </div>
      ),
      variant: "destructive",
    });
  };
  
  return {
    validateClient,
    showValidationErrors
  };
};

export const useConfirmation = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>>({
    onConfirm: () => {},
    title: '',
    description: '',
  });
  
  const openConfirmation = (config: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    setConfirmConfig(config);
    setIsConfirmOpen(true);
  };
  
  const closeConfirmation = () => {
    setIsConfirmOpen(false);
  };
  
  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      isOpen={isConfirmOpen}
      onClose={closeConfirmation}
      {...confirmConfig}
    />
  );
  
  return {
    openConfirmation,
    closeConfirmation,
    ConfirmationDialogComponent
  };
};
