Checklisthub::Application.routes.draw do
  devise_for :users
  
  resources :users do
    resources :list_shares
  end
    
  resources :lists
  resource  :home, :anonymous_user_registration
  root :to => "home#show"
end
