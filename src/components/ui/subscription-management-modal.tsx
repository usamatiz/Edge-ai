'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, AlertCircle, CheckCircle, CreditCard, AlertTriangle } from 'lucide-react'
import { apiService, SubscriptionData } from '@/lib/api-service'
import { useNotificationStore } from './global-notification'
import LoadingButton from './loading-button'
import { useModalScrollLock } from '@/hooks/useModalScrollLock'

interface SubscriptionManagementModalProps {
    isOpen: boolean
    onClose: () => void
    currentSubscription: SubscriptionData | null
    onSubscriptionUpdated?: () => void
}

interface Plan {
    id: string
    name: string
    price: number
    features: string[]
}

export default function SubscriptionManagementModal({
    isOpen,
    onClose,
    currentSubscription,
    onSubscriptionUpdated
}: SubscriptionManagementModalProps) {
    // Use the custom scroll lock hook
    useModalScrollLock(isOpen)
    
    const [plans, setPlans] = useState<Plan[]>([])
    const [plansLoading, setPlansLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<string>('')
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const { showNotification } = useNotificationStore()

    const fetchPlans = useCallback(async () => {
        try
        {
            setPlansLoading(true)
            setError(null)
            const response = await apiService.getPricingPlans()

            if (response.success && response.data && Array.isArray(response.data.plans))
            {
                setPlans(response.data.plans)
            } else
            {
                const errorMsg = response.message || 'Failed to fetch subscription plans'
                setError(errorMsg)
                showNotification(errorMsg, 'error')
            }
        } catch (err)
        {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load subscription plans'
            setError(errorMsg)
            showNotification(errorMsg, 'error')
        } finally
        {
            setPlansLoading(false)
        }
    }, [showNotification])

    useEffect(() => {
        if (isOpen)
        {
            fetchPlans()
            if (currentSubscription)
            {
                setSelectedPlan(currentSubscription.planId)
            }
        }
    }, [isOpen, currentSubscription, fetchPlans])

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    const handleChangePlan = async () => {
        if (!selectedPlan || selectedPlan === currentSubscription?.planId)
        {
            return
        }

        try
        {
            setActionLoading(true)
            setError(null)
            const response = await apiService.changeSubscriptionPlanWithGlobalLoading(selectedPlan)

            if (response.success)
            {
                // Show success message
                setError(null)
                showNotification(`Subscription plan updated successfully!`, 'success')
                // Call the callback to refresh subscription data
                if (onSubscriptionUpdated && typeof onSubscriptionUpdated === 'function')
                {
                    try
                    {
                        onSubscriptionUpdated()
                    } catch (callbackError)
                    {
                        const errorMsg = callbackError instanceof Error ? callbackError.message : 'Plan updated but failed to refresh data'
                        showNotification(`${errorMsg}`, 'warning')
                    }
                }
                onClose()
            } else
            {
                const errorMsg = response.message || 'Failed to change subscription plan'
                showNotification(`${errorMsg}`, 'error')
                setError(errorMsg)
            }
        } catch (err)
        {
            const errorMsg = err instanceof Error ? err.message : 'Failed to change subscription plan'
            showNotification(`${errorMsg}`, 'error')
            setError(errorMsg)
        } finally
        {
            setActionLoading(false)
        }
    }

    const handleCancelSubscription = async () => {
        try
        {
            setActionLoading(true)
            setError(null)
            const response = await apiService.cancelSubscriptionWithGlobalLoading()

            if (response.success)
            {
                // Show success message
                setError(null)
                showNotification('Subscription cancelled successfully!', 'success')
                if (onSubscriptionUpdated && typeof onSubscriptionUpdated === 'function')
                {
                    try
                    {
                        onSubscriptionUpdated()
                    } catch (callbackError)
                    {
                        const errorMessage = callbackError instanceof Error ? callbackError.message : 'Failed to refresh data'
                        showNotification(`Subscription cancelled but ${errorMessage}`, 'warning')
                    }
                }
                onClose()
            } else
            {
                const errorMsg = response.message || 'Failed to cancel subscription'
                setError(errorMsg)
                showNotification(errorMsg, 'error')
            }
        } catch (err)
        {
            const errorMsg = err instanceof Error ? err.message : 'Failed to cancel subscription'
            showNotification(`${errorMsg}`, 'error')
            setError(errorMsg)
        } finally
        {
            setActionLoading(false)
        }
    }

    const getPlanDisplayName = (planId: string) => {
        switch (planId)
        {
            case 'basic':
                return 'Basic Plan'
            case 'growth':
                return 'Growth Plan'
            case 'enterprise':
                return 'Enterprise Plan'
            default:
                return planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan'
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 100)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-[#282828] flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Manage Subscription
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    {/* Current Subscription Info */}
                    {currentSubscription && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Current Subscription</h4>
                            <p className="text-blue-700">
                                {getPlanDisplayName(currentSubscription.planId)} •
                                Status: <span className="font-medium capitalize">{currentSubscription.status}</span>
                            </p>
                        </div>
                    )}

                    {/* Change Plan Section */}
                    <div className="mb-8">
                        <h4 className="text-lg font-semibold text-[#282828] mb-4">Change Plan</h4>

                        {plansLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5046E5]"></div>
                                <span className="ml-3 text-[#5F5F5F]">Loading plans...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedPlan === plan.id
                                            ? 'border-[#5046E5] bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedPlan(plan.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-medium text-[#282828]">{plan.name}</h5>
                                            {selectedPlan === plan.id && (
                                                <CheckCircle className="h-5 w-5 text-[#5046E5]" />
                                            )}
                                        </div>
                                        <p className="text-2xl font-bold text-[#282828] mb-2">
                                            {formatPrice(plan.price)}
                                        </p>
                                        <ul className="text-sm text-[#5F5F5F] space-y-1">
                                            {plan.features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}

                        <LoadingButton
                            onClick={handleChangePlan}
                            loading={actionLoading}
                            disabled={actionLoading || !selectedPlan || selectedPlan === currentSubscription?.planId}
                            loadingText="Updating Plan..."
                            variant="primary"
                            size="md"
                            fullWidth
                            className="py-3 px-6 rounded-lg"
                        >
                            Update Plan
                        </LoadingButton>
                    </div>

                    {/* Cancel Subscription Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-[#282828] mb-4">Cancel Subscription</h4>

                        {currentSubscription?.cancelAtPeriodEnd ? (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-yellow-800 mb-1">Subscription Already Cancelled</h5>
                                        <p className="text-yellow-700 text-sm">
                                            Your subscription will end on {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}. You&apos;ll continue to have access until then.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : !showCancelConfirm ? (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        ) : (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <h5 className="font-medium text-red-800 mb-1">Are you sure?</h5>
                                        <p className="text-red-700 text-sm">
                                            Cancelling your subscription will end your access at the end of the current billing period.
                                            You can reactivate anytime.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <LoadingButton
                                        onClick={handleCancelSubscription}
                                        loading={actionLoading}
                                        disabled={actionLoading}
                                        loadingText="Cancelling..."
                                        variant="danger"
                                        size="sm"
                                        className="px-4 py-2 rounded-lg"
                                    >
                                        Yes, Cancel Subscription
                                    </LoadingButton>
                                    <button
                                        onClick={() => setShowCancelConfirm(false)}
                                        disabled={actionLoading}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Keep Subscription
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
