import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useAuth } from "../auth/auth-context"
import {
  loadUserProfile,
  saveUserProfile,
  type BuyerProfile,
  type FarmerProfile,
  type UserProfile,
  type UserRole,
} from "../lib/userProfile"
import { applyPendingRoleForUser } from "../lib/pendingRole"
import {
  acceptFarmerOffer,
  createBuyerRequest,
  listLinks,
  listRequests,
  listResponses,
  rejectFarmerOffer,
  sendCounterOffer,
  submitFarmerResponse,
  subscribeDemand,
  type BuyerRequest,
  type FarmBuyerLink,
  type FarmerResponse,
} from "../lib/demandNetwork"

type NetworkValue = {
  profile: UserProfile | null
  role: UserRole | null
  refreshProfile: () => void
  saveProfile: (next: UserProfile) => void
  requests: BuyerRequest[]
  responses: FarmerResponse[]
  links: FarmBuyerLink[]
  refreshNetwork: () => void
  publishRequest: typeof createBuyerRequest
  offerResponse: typeof submitFarmerResponse
  acceptOffer: typeof acceptFarmerOffer
  rejectOffer: typeof rejectFarmerOffer
  counterOffer: typeof sendCounterOffer
  farmerProfile: FarmerProfile | null
  buyerProfile: BuyerProfile | null
}

const Ctx = createContext<NetworkValue | null>(null)

export function FarmProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [responses, setResponses] = useState<FarmerResponse[]>([])
  const [links, setLinks] = useState<FarmBuyerLink[]>([])

  const refreshProfile = useCallback(() => {
    setProfile(loadUserProfile(user?.uid))
  }, [user?.uid])

  const refreshNetwork = useCallback(() => {
    setRequests(listRequests())
    setResponses(listResponses())
    setLinks(listLinks())
  }, [])

  useEffect(() => {
    if (user?.uid) {
      applyPendingRoleForUser(user.uid, user.displayName)
    }
    refreshProfile()
    refreshNetwork()
  }, [user?.uid, user?.displayName, refreshProfile, refreshNetwork])

  useEffect(() => subscribeDemand(refreshNetwork), [refreshNetwork])

  const saveProfile = useCallback((next: UserProfile) => {
    saveUserProfile(next)
    setProfile(next)
  }, [])

  const value = useMemo<NetworkValue>(
    () => ({
      profile,
      role: profile?.role ?? null,
      refreshProfile,
      saveProfile,
      requests,
      responses,
      links,
      refreshNetwork,
      publishRequest: (input) => {
        const created = createBuyerRequest(input)
        refreshNetwork()
        return created
      },
      offerResponse: (input) => {
        const created = submitFarmerResponse(input)
        refreshNetwork()
        return created
      },
      acceptOffer: (id) => {
        const link = acceptFarmerOffer(id)
        refreshNetwork()
        return link
      },
      rejectOffer: (id) => {
        rejectFarmerOffer(id)
        refreshNetwork()
      },
      counterOffer: (id, counter) => {
        sendCounterOffer(id, counter)
        refreshNetwork()
      },
      farmerProfile: profile?.role === "farmer" ? profile : null,
      buyerProfile: profile?.role === "buyer" ? profile : null,
    }),
    [profile, requests, responses, links, refreshProfile, saveProfile, refreshNetwork],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFarmProfile() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    return {
      profile: null,
      refresh: () => undefined,
      save: () => undefined,
      selectedCrop: null as string | null,
    }
  }
  return {
    profile:
      ctx.farmerProfile != null
        ? {
            userId: ctx.farmerProfile.userId,
            latitude: ctx.farmerProfile.latitude,
            longitude: ctx.farmerProfile.longitude,
            locationName: ctx.farmerProfile.locationName,
            city: ctx.farmerProfile.city,
            state: ctx.farmerProfile.state,
            country: ctx.farmerProfile.country,
            selectedCrop: ctx.farmerProfile.selectedCrop,
            onboardingCompleted: ctx.farmerProfile.onboardingCompleted,
            timestamp: ctx.farmerProfile.timestamp,
            soilEstimate: ctx.farmerProfile.soilEstimate,
            climateNote: ctx.farmerProfile.climateNote,
          }
        : null,
    refresh: ctx.refreshProfile,
    save: (next: {
      userId: string
      latitude: number
      longitude: number
      locationName: string
      city: string | null
      state: string | null
      country: string | null
      selectedCrop: string
      onboardingCompleted: boolean
      timestamp: string
      soilEstimate?: string | null
      climateNote?: string | null
    }) => {
      const farmer: FarmerProfile = {
        userId: next.userId,
        role: "farmer",
        onboardingCompleted: next.onboardingCompleted,
        timestamp: next.timestamp,
        displayName: ctx.farmerProfile?.displayName ?? null,
        latitude: next.latitude,
        longitude: next.longitude,
        locationName: next.locationName,
        city: next.city,
        state: next.state,
        country: next.country,
        farmSizeAcres: ctx.farmerProfile?.farmSizeAcres ?? null,
        selectedCrop: next.selectedCrop,
        growthStage: ctx.farmerProfile?.growthStage ?? "Unspecified",
        irrigation: ctx.farmerProfile?.irrigation ?? "Unspecified",
        expectedHarvestKg: ctx.farmerProfile?.expectedHarvestKg ?? null,
        preferredCrops: ctx.farmerProfile?.preferredCrops ?? [next.selectedCrop],
        mobileNumber: ctx.farmerProfile?.mobileNumber || "",
        soilEstimate: next.soilEstimate,
        climateNote: next.climateNote,
      }
      ctx.saveProfile(farmer)
    },
    selectedCrop: ctx.farmerProfile?.selectedCrop ?? null,
  }
}

export function useDemandNetwork() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error("useDemandNetwork requires FarmProfileProvider")
  }
  return ctx
}
