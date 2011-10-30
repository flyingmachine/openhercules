Checklisthub::Application.routes.draw do
  devise_for :users

  resources :lists
  resource  :home, :anonymous_user_registration
  root :to => "home#show"
end
